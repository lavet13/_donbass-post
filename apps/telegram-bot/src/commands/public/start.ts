import type { TContext } from "@/types/context";
import { Command, LanguageCodes } from "@grammyjs/commands";
import { getCommandListText } from "@/commands/utils";
import { Permissions } from "@/rbac/types";
import { userHasPermission } from "@/rbac/guards";

export const startCommand = new Command<TContext>(
  "start",
  "Начать работу с ботом",
  async (ctx) => {
    const username = ctx.from?.first_name || "пользователь";
    const manager = await userHasPermission(ctx, Permissions.BOT_VIEW_STATUS);
    const admin = await userHasPermission(ctx, Permissions.USERS_MANAGE);

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
startCommand.localize(
  LanguageCodes.English,
  "start",
  "Start working with the bot",
);
