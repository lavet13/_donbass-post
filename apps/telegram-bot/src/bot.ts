import { Bot, Context, GrammyError, HttpError } from "grammy";
import { formatRussianDateTime } from "@/utils";
import { autoRetry } from "@grammyjs/auto-retry";

export type TCustomBot = Bot<Context> & {};

export function createBotInstance(token: string): TCustomBot {
  const bot = new Bot(token) as TCustomBot;

  return bot;
}

function runBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return console.error("Telegram bot token was not provided, exiting...");
  }

  try {
    const bot = createBotInstance(token);

    bot.api.config.use(
      autoRetry({
        maxRetryAttempts: 5,
        maxDelaySeconds: 300,
      }),
    );

    bot.catch((err) => {
      const ctx = err.ctx;
      const updateId = ctx?.update?.update_id ?? "—";
      console.error(`Error in update ${updateId}:`, err);

      const e = err.error;

      let prefix = "";
      if (ctx?.from) {
        prefix = `from user ${ctx.from.id} (${ctx.from.username || "no username"}) `;
      }
      if (ctx?.chat) {
        prefix += `in chat ${ctx.chat.id} (${ctx.chat.type}) `;
      }

      if (e instanceof GrammyError) {
        const desc = e.description;
        const params = e.parameters ? JSON.stringify(e.parameters) : "";

        switch (e.error_code) {
          // Bot was blocked / kicked / chat not found
          case 403: {
            console.warn(`Bot blocked/kicked/chat not found ${prefix}`);
            break;
          }

          // Flood wait
          case 429: {
            const retryAfter = e.parameters.retry_after ?? "uknown";
            console.warn(
              `Rate limited ${prefix}, retry after ${retryAfter} sec`,
            );
            break;
          }

          // Bad request
          case 400: {
            console.error(`Bad request ${prefix}:${desc}`);
            break;
          }

          default:
            console.error(
              `Other Telegram API error ${prefix} (code ${e.error_code}): ${desc} ${params}`,
            );
        }
      } else if (e instanceof HttpError) {
        console.error(`Network/HTTP error ${prefix}:`, e);
      } else {
        console.error(`Unexpected error ${prefix}:`, e);
      }
    });

    bot.on("callback_query:data", async (ctx) => {
      const payload = ctx.callbackQuery.data;
      console.warn("Unknown button event with payload", {
        payload,
        timestamp: formatRussianDateTime(new Date()),
      });
      await ctx.answerCallbackQuery({
        text: "Необработанное действие 😥",
      });
    });

    // do not await start method, because it's infinite, unless stopped
    bot.start();
    console.warn("Telegram Bot started!");

    return bot;
  } catch (error) {
    console.error(
      "Startup error:",
      error instanceof Error ? error.stack : error,
    );
    return undefined;
  }
}

export const bot = runBot();

if (bot) {
  process.once("SIGINT", () => {
    bot.stop();
    console.warn("Bot stopped (SIGINT)");
  });
  process.once("SIGTERM", () => {
    bot.stop();
    console.warn("Bot stopped (SIGTERM)");
  });
}
