import { type TContext } from "@/types/context";
import {
  readCargoWorkbook,
  replaceCargoData,
  type CargoWorkbook,
} from "@/cargo-tracking/import";
import { InlineKeyboard, type Composer } from "grammy";
import { createKeyedLock } from "@/utils/keyed-lock";
import { withProgress } from "@/utils/with-progress";
import { ruCount } from "@/utils/plural";

type UploadSession = {
  statusMessageId: number | null; // the current status message (deleted and re-sent on each file)
  files: { name: string; workbook: CargoWorkbook }[];
  updatedAt: number; // Date.now(); a session idle > 30 min is treated as gone
};
const sessions = new Map<number, UploadSession>(); // chat id → session

// one upload step at a time per chat: files sent together can't overwrite each other's session update.
const runExclusive = createKeyedLock<number>();

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

const FILE_FORMS = { one: "файл", few: "файла", many: "файлов" };
const filesCount = (n: number) => ruCount(n, FILE_FORMS);

/**
 * Reads an uploaded cargo file and checks it isn't an empty template.
 * Throws an Error whose message is meant for the manager.
 */
export async function readCargoFile(
  buffer: Buffer,
  fileName: string,
): Promise<CargoWorkbook> {
  const wb = await readCargoWorkbook(buffer);
  // reject only an empty template; a month with only СВХ or delivery rows is still real data
  const total =
    wb.shipments.length + wb.movements.length + wb.deliveries.length;
  if (total === 0)
    throw new Error(`В файле «${fileName}» нет ни одной строки с ТТН`);
  return wb;
}

/**
 * Adds a checked cargo file to the chat's upload session and re-posts the
 * status list at the bottom. A file with the same name (download counter
 * ignored) replaces its old entry.
 */
export async function addCargoFile(
  ctx: TContext,
  chatId: number,
  fileName: string,
  workbook: CargoWorkbook,
) {
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
}

/**
 * Registers «Загрузить» / «Отмена» of the cargo upload session. Files arrive
 * through the shared document handler (uploads/document.ts). Nothing touches
 * the database until «Загрузить» is pressed: importing file by file would let
 * each file wipe the others' months.
 */
export function registerCargoCallbacks(router: Composer<TContext>) {
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
