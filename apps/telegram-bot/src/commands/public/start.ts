import type { TContext } from "@/types";
import { Command, LanguageCodes } from "@grammyjs/commands";
import { isActiveManager, isRootAdmin } from "@/commands/guards";
import { getCommandListText } from "@/commands/utils";

export const startCommand = new Command<TContext>(
  "start",
  "Начать работу с ботом",
  async (ctx) => {
    const username = ctx.from?.first_name || "пользователь";
    const manager = await isActiveManager(ctx);
    const admin = isRootAdmin(ctx);

    await ctx.reply(
      `👋 Привет ${username}! Я бот <b>Нашей Почты</b>.\n\n` +
        "Я помогаю обрабатывать заявки и уведомления.\n\n" +
        getCommandListText({ manager, admin }),
      { parse_mode: "HTML" },
    );
  },
);

startCommand.localize(LanguageCodes.Russian, "start", "Начать работу с ботом");
startCommand.localize(
  LanguageCodes.Ukrainian,
  "start",
  "Почати роботу з ботом",
);
