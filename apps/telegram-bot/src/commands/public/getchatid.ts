import type { TContext } from "@/types";
import { Command } from "@grammyjs/commands";

export const getChatIdCommand = new Command<TContext>(
  "getchatid",
  "Получить свой Chat ID",
  async (ctx) => {
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id;
    const username = ctx.from?.username;

    await ctx.reply(
      "🆔 <b>Ваши идентификаторы</b>\n\n" +
        `Chat ID: <code>${chatId}</code>\n` +
        `User ID: <code>${userId}</code>\n` +
        (username ? `Username: @${username}` : ""),
      { parse_mode: "HTML" },
    );
  },
);
