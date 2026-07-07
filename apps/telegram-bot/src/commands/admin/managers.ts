import { Command, LanguageCodes } from "@grammyjs/commands";
import { userHasPermission } from "@/rbac/guards";
import type { TContext } from "@/types/context";
import { prisma } from "@/prisma";
import { getCommandListText } from "@/commands/utils";
import { Permissions, Roles } from "@/rbac/types";

export const managersCommand = new Command<TContext>(
  "managers",
  "Информация о менеджерах",
  async (ctx) => {
    const manager = await userHasPermission(ctx, Permissions.BOT_VIEW_STATUS);
    const admin = await userHasPermission(ctx, Permissions.USERS_MANAGE);

    const managers = await prisma.userRole.findMany({
      where: {
        revokedAt: null,
        role: { name: Roles.MANAGER },
        user: { isActive: true },
      },
      select: { user: { select: { chatId: true } } },
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
      (row, index) =>
        `${index + 1}. Chat ID: <code>${row.user.chatId}</code>`,
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

managersCommand.localize(
  LanguageCodes.Russian,
  "managers",
  "Информация о менеджерах",
);
managersCommand.localize(
  LanguageCodes.Ukrainian,
  "managers",
  "Інформація про менеджерів",
);
managersCommand.localize(
  LanguageCodes.English,
  "managers",
  "Manager information",
);
