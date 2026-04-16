import type { TContext } from "@/types";
import { Command } from "@grammyjs/commands";
import { isActiveManager, isRootAdmin } from "@/commands/guards";
import { getCommandListText } from "@/commands/utils";

export const helpCommand = new Command<TContext>(
  "help",
  "Помощь",
  async (ctx) => {
    const manager = await isActiveManager(ctx);
    const admin = isRootAdmin(ctx);

    await ctx.reply(
      "ℹ️ <b>Помощь</b>\n\n" +
        "Этот бот используется для обработки заявок на доставку.\n\n" +
        getCommandListText({ manager, admin }),
      { parse_mode: "HTML" },
    );
  },
);
