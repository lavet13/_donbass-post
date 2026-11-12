import { type TContext } from "@/types/context";
import {
  readCargoWorkbook,
  replaceCargoData,
  type CargoWorkbook,
} from "@/cargo-tracking/import";
import { InlineKeyboard, type Composer } from "grammy";
import { createKeyedLock } from "@/utils/keyed-lock";
import { withProgress } from "@/utils/with-progress";
import { downloadTelegramFile } from "@/utils/telegram-file";

type UploadSession = {
  statusMessageId: number | null; // the current status message (deleted and re-sent on each file)
  files: { name: string; workbook: CargoWorkbook }[];
  updatedAt: number; // Date.now(); a session idle > 30 min is treated as gone
};
const sessions = new Map<number, UploadSession>(); // chat id → session
const MAX_DOWNLOAD_BYTES = 20 * 1024 * 1024; // Bot API getFile limit(20MB)

// one upload step at a time per chat: files sent together can't overwrite each other's session update.
const runExclusive = createKeyedLock<number>();

/**
 * Registers the cargo upload flow on a manager-only router. Each .xlsx file is
 * downloaded and checked on arrival (a wrong file is rejected right away), then
 * added to the chat's upload session, that’s re-posted at the bottom as files arrive.
 * Nothing touches the database until «Загрузить» is pressed:
 * importing file by file would let each file wipe the others' months.
 */
export function registerCargoUpload(router: Composer<TContext>) {
  router.on("message:document", async (ctx) => {
    const doc = ctx.message.document;
    if (
      doc.file_name !== undefined &&
      !doc.file_name.toLowerCase().endsWith(".xlsx")
    ) {
      await ctx.reply("❌ Нужен файл Excel (.xlsx)");
      return;
    }

    if ((doc.file_size ?? 0) > MAX_DOWNLOAD_BYTES) {
      await ctx.reply(
        "❌ Файл больше 20 МБ, Telegram не даёт боту его скачать",
      );
      return;
    }

    const chatId = ctx.chat.id;
    const fileName = doc.file_name ?? "файл.xlsx";

    const progress = await ctx.reply(`⏳ Обрабатываю «${fileName}»`, {
      reply_parameters: { message_id: ctx.message.message_id }, // shows as a reply to the file
    });
    const show = (text: string) =>
      ctx.api.editMessageText(chatId, progress.message_id, text);
    let workbook: CargoWorkbook;

    // document handler
    try {
      workbook = await withProgress(
        show,
        `⏳ Обрабатываю «${fileName}»`,
        async () => {
          const buffer = await downloadTelegramFile(ctx.api, doc.file_id);
          const wb = await readCargoWorkbook(buffer);

          // after: reject only an empty template; a month with only СВХ or
          // delivery rows is still real data
          const total =
            wb.shipments.length + wb.movements.length + wb.deliveries.length;
          if (total === 0) {
            throw new Error(`В файле «${fileName}» нет ни одной строки с ТТН`);
          }

          return wb; // the value comes OUT of withProgress, no closure assignment
        },
      );
    } catch (err) {
      // every failure above throws an Error whose message is meant for the manager
      console.error("[cargo-upload] file rejected:", err);
      await show(
        `❌ ${err instanceof Error ? err.message : "Не удалось обработать файл"}`,
      ).catch(() => {});
      return;
    }

    // success: the re-posted status list replaces the progress message
    await ctx.api.deleteMessage(chatId, progress.message_id).catch(() => {});

    // Get the session; start a fresh one if there’s none or it’s older than 30 minutes.
    // A file with the same name replaces its old entry.
    await runExclusive(chatId, async () => {
      let session = getLiveSession(chatId);
      if (!session) {
        session = { statusMessageId: null, files: [], updatedAt: Date.now() };
        sessions.set(chatId, session);
      }

      session.files = session.files.filter(
        (f) => uploadKey(f.name) !== uploadKey(fileName),
      );
      session.files.push({ name: fileName, workbook });
      session.updatedAt = Date.now();

      const { text, keyboard } = renderStatus(session);
      if (session.statusMessageId !== null) {
        // Best effort: if it's already gone (deleted by hand), there's nothing to do
        await ctx.api
          .deleteMessage(chatId, session.statusMessageId)
          .catch(() => {});
      }
      const sent = await ctx.reply(text, { reply_markup: keyboard });
      session.statusMessageId = sent.message_id;
    });

    return;
  });

  router.callbackQuery("cargo:import", async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.chat) return;
    const chatId = ctx.chat.id;
    await runExclusive(chatId, async () => {
      const session = getLiveSession(chatId);
      // a tap on an older status message must not act on the current session
      if (
        !session ||
        ctx.callbackQuery.message?.message_id !== session.statusMessageId
      ) {
        await ctx.editMessageText(
          "⌛ Этот список устарел. Отправьте файлы заново.",
        );
        return;
      }

      try {
        const { shipments, movements, deliveries } = await withProgress(
          (t) => ctx.editMessageText(t),
          `⏳ Загружаю ${filesCount(session.files.length)}`,
          () => replaceCargoData(session.files.map((f) => f.workbook)),
        );
        sessions.delete(chatId);
        await ctx.editMessageText(
          `✅ Загружено ${filesCount(session.files.length)}: грузы ${shipments} / СВХ ${movements} / выдача ${deliveries}. Поиск уже обновлён`,
        );
      } catch (err) {
        console.error(
          "[cargo-tracking] failed to execute transaction to db",
          err,
        );
        const { text, keyboard } = renderStatus(session);
        await ctx.editMessageText(
          text +
            "\n❌ Не удалось загрузить. Старые данные не изменены, попробуйте ещё раз.",
          {
            reply_markup: keyboard,
          },
        );
        return;
      }
    });
  });
  router.callbackQuery("cargo:cancel", async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.chat) return;
    const chatId = ctx.chat.id;
    await runExclusive(chatId, async () => {
      const session = getLiveSession(chatId);
      if (session) {
        sessions.delete(chatId);
      }
      await ctx.editMessageText("Отменено. Данные не изменились");
      return;
    });
  });
}

/**
 * The name used to match files in a session: the download counter a browser or
 * Telegram adds to duplicates is dropped, so «окт (23).xlsx» and «окт (24).xlsx»
 * count as the same month and the later one replaces the earlier.
 */
function uploadKey(name: string): string {
  // \s*\(\d+\) = optional spaces, then "(digits)"; (?=\.xlsx$) = only when it's
  // directly before the extension; i = also matches .XLSX
  return name.replace(/\s*\(\d+\)(?=\.xlsx$)/i, "");
}

/** The chat's upload session, or undefined if there is none or it has expired (then it's dropped). */
function getLiveSession(chatId: number): UploadSession | undefined {
  const SESSION_TTL_MS = 30 * 60 * 1000; // a session idle longer than this starts over
  const session = sessions.get(chatId);
  if (session && Date.now() - session.updatedAt > SESSION_TTL_MS) {
    sessions.delete(chatId);
    return undefined;
  }
  return session;
}

/** Status message for an upload session: the file list plus the two buttons. */
function renderStatus(session: UploadSession) {
  const lines = session.files.map(
    (f, i) =>
      `${i + 1}. ${f.name} — грузы ${f.workbook.shipments.length} / СВХ ${f.workbook.movements.length} / выдача ${f.workbook.deliveries.length}`,
  );
  const text = [
    `📥 Файлы для загрузки (${filesCount(session.files.length)}). Можно отправить ещё или нажать «Загрузить»:`,
    ...lines,
  ].join("\n");
  const keyboard = new InlineKeyboard()
    .text(`✅ Загрузить (${session.files.length})`, "cargo:import")
    .text("❌ Отмена", "cargo:cancel");
  return { text, keyboard };
}

const ruPlural = new Intl.PluralRules("ru"); // knows Russian plural categories
// Record<string, string>: select() can also return "other"/"zero", so look up by any string
const FILE_FORMS: Record<string, string> = {
  one: "файл",
  few: "файла",
  many: "файлов",
};

/** "1 файл", "2 файла", "5 файлов", "21 файл": the form follows the number's last digits. */
function filesCount(n: number): string {
  return `${n} ${FILE_FORMS[ruPlural.select(n)] ?? "файла"}`;
}
