import { Bot, Context, GrammyError, HttpError } from "grammy";
import { formatRussianDateTime } from "@/utils";

export type TCustomBot = Bot<Context> & {};

export function createBotInstance(token: string): TCustomBot {
  const bot = new Bot(token) as TCustomBot;

  return bot;
}

function runBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token)
    return console.error("Telegram bot token was not provided, exiting...");

  try {
    const bot = createBotInstance(token);

    bot.catch((error) => {
      const ctx = error.ctx;

      console.error(`Error while handling update ${ctx.update.update_id}`);

      const e = error.error;
      if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
      } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
      } else {
        console.error("Unknown error:", e);
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
    console.error("Error occured:", error);
  }
}

export const bot = runBot();
