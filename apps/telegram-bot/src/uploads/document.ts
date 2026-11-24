import type { Api, Composer } from "grammy";
import type { TContext } from "@/types/context";
import { isCargoWorkbook, type CargoWorkbook } from "@/cargo-tracking/import";
import {
  addCargoFile,
  readCargoFile,
  registerCargoCallbacks,
} from "@/cargo-tracking/upload";
import type { ReadyWorkbook } from "@/tracking/period";
import { readTrackingWorkbook } from "@/tracking/read";
import { addTrackingFile, registerTrackingCallbacks } from "@/tracking/upload";
import { downloadTelegramFile } from "@/utils/telegram-file";
import { withProgress } from "@/utils/with-progress";

const MAX_DOWNLOAD_BYTES = 20 * 1024 * 1024; // Bot API getFile limit (20 MB)

type Upload =
  | { kind: "tracking"; workbook: ReadyWorkbook }
  | { kind: "cargo"; workbook: CargoWorkbook };

/**
 * Registers every file upload on a manager-only router: one document handler
 * that recognises the file, plus the buttons of both flows. A manager just
 * sends a file; working out which upload it belongs to is the bot's job.
 */
export function registerUploads(router: Composer<TContext>) {
  registerCargoCallbacks(router);
  registerTrackingCallbacks(router);

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
    const label = `⏳ Обрабатываю «${fileName}»`;
    const progress = await ctx.reply(label, {
      reply_parameters: { message_id: ctx.message.message_id }, // shows as a reply to the file
    });
    const show = (text: string) =>
      ctx.api.editMessageText(chatId, progress.message_id, text);

    let upload: Upload;
    try {
      upload = await withProgress(show, label, () =>
        recognise(ctx.api, doc.file_id, fileName),
      );
    } catch (err) {
      // every failure in recognise throws an Error whose message is meant for the manager
      console.error("[upload] file rejected:", err);
      await show(
        `❌ ${err instanceof Error ? err.message : "Не удалось обработать файл"}`,
      ).catch(() => {});
      return;
    }

    if (upload.kind === "tracking") {
      // the progress message becomes this file's report
      await addTrackingFile(
        ctx,
        chatId,
        progress.message_id,
        fileName,
        upload.workbook,
      );
    } else {
      // the re-posted cargo list replaces the progress message
      await ctx.api.deleteMessage(chatId, progress.message_id).catch(() => {});
      await addCargoFile(ctx, chatId, fileName, upload.workbook);
    }
  });
}

/**
 * Downloads a file and works out which upload it is. Tracking is tried first,
 * with the streaming reader: cargo's reader loads the whole workbook into
 * memory, and an ИМ file loaded that way needs ~470 MiB, which would get the
 * bot killed by its 500 MiB container limit. Throws an Error whose message is
 * meant for the manager.
 */
async function recognise(
  api: Api,
  fileId: string,
  fileName: string,
): Promise<Upload> {
  const buffer = await downloadTelegramFile(api, fileId);

  const tracking = await readTrackingWorkbook(buffer);
  if (tracking.ok) return { kind: "tracking", workbook: tracking };

  // Not a tracking file: cargo if it has a cargo sheet, judged by the names
  // the stream already saw, so an unknown large workbook is never loaded whole
  if (tracking.reason === "unknown" && isCargoWorkbook(tracking.sheetNames))
    return { kind: "cargo", workbook: await readCargoFile(buffer, fileName) };

  if (tracking.reason === "unknown")
    throw new Error(
      "Не удалось определить тип файла: это не файл грузов и не Ростов, ЛНР, ALI или ИМ",
    );
  throw new Error(tracking.error); // not an xlsx, or sheets of different kinds
}
