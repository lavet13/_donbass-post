import { InlineKeyboard, type Composer } from "grammy";
import type { TContext } from "@/types/context";
import { ruDay } from "@/utils/cell";
import { createKeyedLock } from "@/utils/keyed-lock";
import { ruCount } from "@/utils/plural";
import { withProgress } from "@/utils/with-progress";
import { countReplacedRows, replaceTrackingFiles } from "./import";
import { KIND_LABELS } from "./parse";
import { trackingPeriod, type ReadyWorkbook } from "./period";
import type { RowIssue } from "./read";

type SessionFile = {
  fileName: string;
  workbook: ReadyWorkbook;
  toReplace: number; // rows its import will delete, counted when the file arrived
  reportMessageId: number; // the file's report (a reply to the file)
};

type TrackingSession = {
  statusMessageId: number | null; // the list with the buttons, re-posted at the bottom on each file
  files: SessionFile[]; // one per kind, in the order they arrived
  updatedAt: number; // Date.now(); a session idle > 30 min is treated as gone
};

const sessions = new Map<number, TrackingSession>(); // chat id → session
const SESSION_TTL_MS = 30 * 60 * 1000;

// one step at a time per chat: a file can't change the session while
// «Загрузить» is importing it
const runExclusive = createKeyedLock<number>();

const ROW_FORMS = { one: "строка", few: "строки", many: "строк" };
const FILE_FORMS = { one: "файл", few: "файла", many: "файлов" };
const MAX_ISSUES_SHOWN = 10; // per list
const MAX_TEXT = 3900; // Telegram allows 4096; room for the «заменён» line

/**
 * Adds a recognised tracking file to the chat's upload session. Its progress
 * message becomes the file's report (period, rows, what was skipped), and the
 * session's list with «Загрузить» is re-posted at the bottom, so files sent
 * together end up in one list and are imported with one press. One file per
 * kind: a newer Rostov file replaces the older one, whose report says so.
 * Nothing touches the database until «Загрузить».
 */
export async function addTrackingFile(
  ctx: TContext,
  chatId: number,
  reportMessageId: number,
  fileName: string,
  workbook: ReadyWorkbook,
) {
  const report = (text: string) =>
    ctx.api.editMessageText(chatId, reportMessageId, text).catch(() => {});

  let toReplace: number;
  try {
    toReplace = await countReplacedRows(workbook);
  } catch (err) {
    console.error("[tracking-upload] count failed:", err);
    await report("❌ Не удалось проверить базу, отправьте файл ещё раз");
    return;
  }

  const file: SessionFile = { fileName, workbook, toReplace, reportMessageId };
  await report(fileReport(file));

  await runExclusive(chatId, async () => {
    let session = getLiveSession(chatId);
    if (!session) {
      session = { statusMessageId: null, files: [], updatedAt: Date.now() };
      sessions.set(chatId, session);
    }

    const replaced = session.files.find(
      (f) => f.workbook.kind === workbook.kind,
    );
    if (replaced)
      await ctx.api
        .editMessageText(
          chatId,
          replaced.reportMessageId,
          `${fileReport(replaced)}\n\n↩️ Заменён файлом «${fileName}»: загружен не будет`,
        )
        .catch(() => {});

    session.files = session.files.filter(
      (f) => f.workbook.kind !== workbook.kind,
    );
    session.files.push(file);
    session.updatedAt = Date.now();

    // Best effort: if it's already gone (deleted by hand), there's nothing to do
    if (session.statusMessageId !== null)
      await ctx.api
        .deleteMessage(chatId, session.statusMessageId)
        .catch(() => {});
    const sent = await ctx.reply(statusText(session), {
      reply_markup: statusKeyboard(session),
    });
    session.statusMessageId = sent.message_id;
  });
}

/** Registers «Загрузить» / «Отмена» of the tracking upload list. */
export function registerTrackingCallbacks(router: Composer<TContext>) {
  router.callbackQuery("tracking:import", async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.chat) return;
    const chatId = ctx.chat.id;

    await runExclusive(chatId, async () => {
      const session = getLiveSession(chatId);
      // a tap on an older list must not import the current session
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
        const results = await withProgress(
          (text) => ctx.editMessageText(text),
          `⏳ Загружаю ${ruCount(session.files.length, FILE_FORMS)}`,
          () => replaceTrackingFiles(session.files),
        );
        sessions.delete(chatId);
        await ctx.editMessageText(
          [
            `✅ Загружено ${ruCount(results.length, FILE_FORMS)}:`,
            ...results.map(
              (r) =>
                `• «${r.fileName}» (${KIND_LABELS[r.workbook.kind]}): ` +
                `удалено ${ruCount(r.deleted, ROW_FORMS)}, добавлено ${ruCount(r.created, ROW_FORMS)}`,
            ),
            "Поиск уже обновлён",
          ].join("\n"),
        );
      } catch (err) {
        console.error("[tracking-upload] import failed:", err);
        await ctx.editMessageText(
          statusText(session) +
            "\n\n❌ Не удалось загрузить. Старые данные не изменены, попробуйте ещё раз.",
          { reply_markup: statusKeyboard(session) },
        );
      }
    });
  });

  router.callbackQuery("tracking:cancel", async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.chat) return;
    const chatId = ctx.chat.id;
    await runExclusive(chatId, async () => {
      sessions.delete(chatId);
      await ctx.editMessageText("Отменено. Данные не изменились");
    });
  });
}

/** The chat's session, or undefined if there is none or it expired (then it's dropped). */
function getLiveSession(chatId: number): TrackingSession | undefined {
  const session = sessions.get(chatId);
  if (session && Date.now() - session.updatedAt > SESSION_TTL_MS) {
    sessions.delete(chatId);
    return undefined;
  }
  return session;
}

/** The list at the bottom: one line per file, what each will replace. */
function statusText(session: TrackingSession): string {
  return [
    `📥 Файлы для загрузки (${ruCount(session.files.length, FILE_FORMS)}). Можно отправить ещё или нажать «Загрузить»:`,
    ...session.files.map(
      (f, i) =>
        `${i + 1}. «${f.fileName}» — ${KIND_LABELS[f.workbook.kind]}: ` +
        `${ruCount(f.workbook.rows.length, ROW_FORMS)}, заменит ${ruCount(f.toReplace, ROW_FORMS)}`,
    ),
  ].join("\n");
}

function statusKeyboard(session: TrackingSession) {
  return new InlineKeyboard()
    .text(`✅ Загрузить (${session.files.length})`, "tracking:import")
    .text("❌ Отмена", "tracking:cancel");
}

/** One file's report: kind, rows, period, what it replaces, and what was skipped. */
function fileReport({ fileName, workbook, toReplace }: SessionFile): string {
  const period = trackingPeriod(workbook);
  const { skippedRows, problems, skippedSheets } = workbook.report;

  const lines = [
    `📥 «${fileName}»: ${KIND_LABELS[workbook.kind]}, ${ruCount(workbook.rows.length, ROW_FORMS)}`,
    period
      ? `Период: ${ruDay(period.from)} – ${ruDay(period.to)}`
      : "В файле нет дат: заменятся только строки без даты",
    `Будет заменено в базе: ${ruCount(toReplace, ROW_FORMS)}`,
  ];
  if (skippedSheets.length > 0)
    lines.push(
      "",
      `Пропущены листы с незнакомыми заголовками: ${skippedSheets.map((s) => `«${s.name}»`).join(", ")}`,
    );
  if (skippedRows.length > 0)
    lines.push(
      "",
      `Не загружено ${ruCount(skippedRows.length, ROW_FORMS)}:`,
      ...issueLines(skippedRows),
    );
  if (problems.length > 0)
    lines.push(
      "",
      `Загружено с замечаниями (дата оставлена пустой) — ${ruCount(problems.length, ROW_FORMS)}:`,
      ...issueLines(problems),
    );

  const text = lines.join("\n");
  return text.length <= MAX_TEXT ? text : `${text.slice(0, MAX_TEXT - 1)}…`;
}

/** The first few issues as «Лист», строка N: text, then how many more. */
function issueLines(issues: RowIssue[]): string[] {
  const shown = issues
    .slice(0, MAX_ISSUES_SHOWN)
    .map((issue) => `• «${issue.sheet}», строка ${issue.row}: ${issue.text}`);
  if (issues.length > MAX_ISSUES_SHOWN)
    shown.push(`…и ещё ${issues.length - MAX_ISSUES_SHOWN}`);
  return shown;
}
