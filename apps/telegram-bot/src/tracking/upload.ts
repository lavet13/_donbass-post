import { InlineKeyboard, type Composer } from "grammy";
import type { TContext } from "@/types/context";
import { ruDay } from "@/utils/cell";
import { createKeyedLock } from "@/utils/keyed-lock";
import { ruCount } from "@/utils/plural";
import { withProgress } from "@/utils/with-progress";
import { countReplacedRows, replaceTrackingRows } from "./import";
import { KIND_LABELS } from "./parse";
import { trackingPeriod, type ReadyWorkbook } from "./period";
import type { RowIssue } from "./read";

type PendingImport = {
  statusMessageId: number; // the confirmation message with the buttons
  fileName: string;
  workbook: ReadyWorkbook;
  toReplace: number; // rows the import will delete, counted when the file arrived
  updatedAt: number; // Date.now(); a confirmation idle > 30 min is treated as gone
};
type Confirmation = Pick<PendingImport, "fileName" | "workbook" | "toReplace">;

const pending = new Map<number, PendingImport>(); // chat id → the file waiting for «Загрузить»
const PENDING_TTL_MS = 30 * 60 * 1000;

// one step at a time per chat: a second file can't replace the pending one
// while «Загрузить» is importing it
const runExclusive = createKeyedLock<number>();

const ROW_FORMS = { one: "строка", few: "строки", many: "строк" };
const MAX_ISSUES_SHOWN = 10; // per list
const MAX_TEXT = 3900; // Telegram allows 4096; room for the error line of a failed import

/**
 * Shows the confirmation for a recognised tracking file: kind, rows, period,
 * how many rows in the base it replaces, and what was skipped. Nothing touches
 * the database until «Загрузить». One pending file per chat: a newer file
 * replaces the older confirmation.
 */
export async function offerTrackingImport(
  ctx: TContext,
  chatId: number,
  fileName: string,
  workbook: ReadyWorkbook,
) {
  let toReplace: number;
  try {
    toReplace = await countReplacedRows(workbook);
  } catch (err) {
    console.error("[tracking-upload] count failed:", err);
    await ctx.reply("❌ Не удалось проверить базу, отправьте файл ещё раз");
    return;
  }

  await runExclusive(chatId, async () => {
    const previous = pending.get(chatId);
    if (previous)
      await ctx.api
        .deleteMessage(chatId, previous.statusMessageId)
        .catch(() => {});

    const confirmation = { fileName, workbook, toReplace };
    const sent = await ctx.reply(confirmationText(confirmation), {
      reply_markup: confirmKeyboard(),
    });
    pending.set(chatId, {
      ...confirmation,
      statusMessageId: sent.message_id,
      updatedAt: Date.now(),
    });
  });
}

/** Registers «Загрузить» / «Отмена» of the tracking confirmation. */
export function registerTrackingCallbacks(router: Composer<TContext>) {
  router.callbackQuery("tracking:import", async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.chat) return;
    const chatId = ctx.chat.id;

    await runExclusive(chatId, async () => {
      const entry = getLivePending(chatId);
      // a tap on an older confirmation must not import the current file
      if (
        !entry ||
        ctx.callbackQuery.message?.message_id !== entry.statusMessageId
      ) {
        await ctx.editMessageText(
          "⌛ Это подтверждение устарело. Отправьте файл заново.",
        );
        return;
      }

      try {
        const { deleted, created } = await withProgress(
          (text) => ctx.editMessageText(text),
          `⏳ Загружаю «${entry.fileName}»`,
          () => replaceTrackingRows(entry.workbook),
        );
        pending.delete(chatId);
        await ctx.editMessageText(
          `✅ «${entry.fileName}» загружен (${KIND_LABELS[entry.workbook.kind]}): ` +
            `удалено ${ruCount(deleted, ROW_FORMS)}, добавлено ${ruCount(created, ROW_FORMS)}. ` +
            "Поиск уже обновлён",
        );
      } catch (err) {
        console.error("[tracking-upload] import failed:", err);
        await ctx.editMessageText(
          confirmationText(entry) +
            "\n\n❌ Не удалось загрузить. Старые данные не изменены, попробуйте ещё раз.",
          { reply_markup: confirmKeyboard() },
        );
      }
    });
  });

  router.callbackQuery("tracking:cancel", async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!ctx.chat) return;
    const chatId = ctx.chat.id;
    await runExclusive(chatId, async () => {
      pending.delete(chatId);
      await ctx.editMessageText("Отменено. Данные не изменились");
    });
  });
}

/** The chat's pending import, or undefined if there is none or it expired (then it's dropped). */
function getLivePending(chatId: number): PendingImport | undefined {
  const entry = pending.get(chatId);
  if (entry && Date.now() - entry.updatedAt > PENDING_TTL_MS) {
    pending.delete(chatId);
    return undefined;
  }
  return entry;
}

function confirmKeyboard() {
  return new InlineKeyboard()
    .text("✅ Загрузить", "tracking:import")
    .text("❌ Отмена", "tracking:cancel");
}

/** The confirmation text; cut to fit one Telegram message. */
function confirmationText({
  fileName,
  workbook,
  toReplace,
}: Confirmation): string {
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
