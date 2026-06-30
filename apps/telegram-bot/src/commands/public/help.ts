import type { TContext } from "@/types/context";
import { Command, LanguageCodes } from "@grammyjs/commands";
import { userHasPermission } from "@/rbac/guards";
import { getCommandListText } from "@/commands/utils";
import { Permissions } from "@/rbac/types";

export const helpCommand = new Command<TContext>(
  "help",
  "Помощь",
  async (ctx) => {
    const manager = await userHasPermission(ctx, Permissions.BOT_VIEW_STATUS);
    const admin = await userHasPermission(ctx, Permissions.USERS_MANAGE);

    await ctx.reply(
      "ℹ️ <b>Помощь</b>\n\n" +
        "Этот бот используется для обработки заявок на доставку.\n\n" +
        getCommandListText({ manager, admin }),
      { parse_mode: "HTML" },
    );
  },
);

helpCommand.localize(LanguageCodes.Russian, "help", "Помощь");
helpCommand.localize(LanguageCodes.Ukrainian, "help", "Допомога");
helpCommand.localize(LanguageCodes.English, "help", "Help");
