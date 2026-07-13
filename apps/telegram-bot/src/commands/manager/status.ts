import { config } from "@/config";
import type { TContext } from "@/types/context";
import { Command, LanguageCodes } from "@grammyjs/commands";
import { version } from "../../../package.json";
import { getCommandListText } from "@/commands/utils";
import { userHasPermission } from "@/rbac/guards";
import { Permissions } from "@/rbac/types";
import { getAllManagers } from "@/managers/service";

export const statusCommand = new Command<TContext>(
  "status",
  "Показать статус бота",
  async (ctx) => {
    const uptime = Math.floor(process.uptime());
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);

    const managerCount = (await getAllManagers()).length;

    const manager = await userHasPermission(ctx, Permissions.BOT_VIEW_STATUS);
    const admin = await userHasPermission(ctx, Permissions.USERS_MANAGE);

    await ctx.reply(
      "✅ <b>Статус бота</b>\n\n" +
        `⏱ <b>Время работы:</b> ${hours}ч ${minutes}м ${seconds}с\n` +
        `🤖 <b>Версия:</b> ${version}\n` +
        `📡 <b>Режим:</b> ${config.telegram.useWebhook ? "webhook" : "polling"}\n` +
        `💾 <b>Память:</b> ${heapUsedMB} / ${heapTotalMB} MB\n` +
        `👥 <b>Менеджеров:</b> ${managerCount}\n` +
        `🌍 <b>Окружение:</b> ${config.server.nodeEnv}\n\n` +
        getCommandListText({ manager, admin }),
      { parse_mode: "HTML" },
    );
  },
);

statusCommand.localize(LanguageCodes.Russian, "status", "Показать статус бота");
statusCommand.localize(
  LanguageCodes.Ukrainian,
  "status",
  "Показати статус бота",
);
statusCommand.localize(LanguageCodes.English, "status", "Show bot status");
