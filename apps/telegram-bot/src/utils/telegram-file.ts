import type { Api } from "grammy";
import { setTimeout as sleep } from "node:timers/promises";
import { makeProxyDispatcher } from "@/utils/proxy";
import { config } from "@/config";
import { fetch } from "undici";

const ATTEMPTS = 3;

/**
 * Downloads a file the bot received, through config.telegram.proxy. The fetch
 * is retried up to 3 times on network failures and 5xx (Telegram's side, usually
 * temporary), never on 4xx (the request is wrong; retrying can't help). getFile
 * itself isn't retried here: it goes through bot.api, where autoRetry applies.
 * Throws an Error whose message is meant for the manager; the real reason is in `cause`.
 */
export async function downloadTelegramFile(
  api: Api,
  fileId: string,
): Promise<Buffer> {
  // Ask Telegram where the file is → { file_path: "documents/file_12.xlsx", … }
  // getFile (no retry here: autoRetry covers bot.api calls). No file_path → throw.
  const file = await api.getFile(fileId);
  if (!file.file_path) {
    throw new Error("Telegram не отдал файл. Отправьте его ещё раз");
  }

  let lastProblem: unknown;
  const url = `https://api.telegram.org/file/bot${config.telegram.token}/${file.file_path}`;
  const dispatcher = makeProxyDispatcher(config.telegram.proxy);

  // Fetch the bytes. In prod, Telegram is reachable only through TELEGRAM_PROXY,
  // Telegram is reachable from prod only through the proxy; getFile serves files up to 20 MB.
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { dispatcher });
      // arrayBuffer() reads the body: a connection dropped mid-download throws
      // here too, and gets retried like any other network failure
      if (res.ok) return Buffer.from(await res.arrayBuffer());

      lastProblem = new Error(`HTTP ${res.status}`); // never log `url`: it contains the bot token
      if (res.status < 500) break; // 4xx: the request itself is wrong, retrying can't help
    } catch (err) {
      lastProblem = err; // connect timeout, reset, ...: worth another try
    }

    if (attempt < ATTEMPTS) await sleep(1000 * attempt); // 1 s, then 2 s
  }

  throw new Error("Не удалось скачать файл. Отправьте его ещё раз", {
    cause: lastProblem,
  });
}
