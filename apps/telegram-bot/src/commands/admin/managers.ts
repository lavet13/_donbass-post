import { Command } from "@grammyjs/commands";
import { isActiveManager, isRootAdmin } from "../guards";
import type { TContext } from "@/types";
import { prisma } from "@/prisma";
import { getCommandListText } from "@/commands/utils";

export const managersCommand = new Command<TContext>(
  "managers",
  "Информация о менеджерах",
  async (ctx) => {
    const manager = await isActiveManager(ctx);
    const admin = isRootAdmin(ctx);

    const managers = await prisma.manager.findMany({
      where: {
        telegramUser: { isActive: true },
      },
      include: {
        telegramUser: true,
      },
    });

    if (managers.length === 0) {
      await ctx.reply(
        "<b>Менеджеры не настроены</b>\n\n" +
          "Добавьте менеджеров командой /addmanager",
        { parse_mode: "HTML" },
      );
      return;
    }

    const list = managers.map(
      (manager, index) =>
        `${index + 1}. Chat ID: <code>${manager.telegramUser.chatId}</code>`,
    );

    await ctx.reply(
      `👥 <b>Список менеджеров</b>\n\n` +
        `Всего менеджеров: ${managers.length}\n\n` +
        `${list.join("\n")}\n\n` +
        getCommandListText({ manager, admin }),
      { parse_mode: "HTML" },
    );
  },
);
