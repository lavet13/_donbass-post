import type { TContext } from "@/types/context";
import { Command, LanguageCodes } from "@grammyjs/commands";

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

getChatIdCommand.localize(
  LanguageCodes.Russian,
  "getchatid",
  "Получить свой Chat ID",
);
getChatIdCommand.localize(
  LanguageCodes.Ukrainian,
  "getchatid",
  "Отримати свій Chat ID",
);
getChatIdCommand.localize(
  LanguageCodes.English,
  "getchatid",
  "Get your Chat ID",
);
