import { config } from "@/config";
import type { Bot, Context } from "grammy";
import {
  preferencesCommand,
  allPreferencesCommand,
} from "@/commands/preferences";
import { NotificationTypes } from "@/types/notification-types";
import { version } from "../../package.json";
import {
  addManagerCommand,
  managersCommand,
  removeManagerCommand,
} from "@/commands/manager-commands";
import {
  appendPreferenceCommand,
  removePreferenceCommand,
  setPreferencesCommand,
} from "@/commands/preference-commands";
import {
  isActiveManager,
  isRootAdmin,
  requireManager,
  requireRootAdmin,
  getRootAdminChatId,
} from "@/commands/guards";
import { getAllManagers } from "@/services/manager-preferences.service";
import type { BotCommand } from "grammy/types";

export const VALID_SLUGS = Object.values(NotificationTypes);

export type CommandHandler = (ctx: Context) => Promise<void>;

export interface Command {
  name: string;
  description: string;
  handler: CommandHandler;

  /**
   * "public"    — shown and accessible to everyone
   * "manager"   — only active managers (+ root admin)
   * "admin"     — only root admin (ROOT_ADMIN_CHAT_ID)
   */
  scope: "public" | "manager" | "admin";
}

export const startCommand: Command = {
  name: "start",
  scope: "public",
  description: "Начать работу с ботом",
  handler: async (ctx) => {
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
};

export const helpCommand: Command = {
  name: "help",
  description: "Помощь",
  scope: "public",
  handler: async (ctx) => {
    const manager = await isActiveManager(ctx);
    const admin = isRootAdmin(ctx);

    await ctx.reply(
      "ℹ️ <b>Помощь</b>\n\n" +
        "Этот бот используется для обработки заявок на доставку.\n\n" +
        getCommandListText({ manager, admin }),
      { parse_mode: "HTML" },
    );
  },
};

export const statusCommand: Command = {
  name: "status",
  description: "Показать статус бота",
  scope: "manager",
  handler: async (ctx) => {
    const uptime = Math.floor(process.uptime());
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);

    const managerCount = config.managers.getChatIds().length;

    const manager = await isActiveManager(ctx);
    const admin = isRootAdmin(ctx);

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
};

export const getChatIdCommand: Command = {
  name: "getchatid",
  scope: "public",
  description: "Получить свой Chat ID",
  handler: async (ctx) => {
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
};

export const commands: Command[] = [
  startCommand,
  helpCommand,
  statusCommand,
  managersCommand,
  getChatIdCommand,
  preferencesCommand,
  allPreferencesCommand,
  setPreferencesCommand,
  appendPreferenceCommand,
  removePreferenceCommand,
  addManagerCommand,
  removeManagerCommand,
];

export function getCommandListText({
  manager = false,
  admin = false,
}: {
  manager?: boolean;
  admin?: boolean;
}): string {
  const visible = commands.filter((cmd) => {
    if (cmd.scope === "public") return true;
    if (cmd.scope === "manager") return manager || admin;
    if (cmd.scope === "admin") return admin;
    return false;
  });

  if (visible.length === 0) return "Команд пока нет 😔";

  const lines = visible.map((cmd) => `/${cmd.name} - ${cmd.description}`);

  return "Доступные команды:\n" + lines.join("\n");
}

export async function registerCommands(bot: Bot) {
  try {
    // 1. Register handlers for all commands
    for (const cmd of commands) {
      bot.command(cmd.name, async (ctx) => {
        if (cmd.scope === "admin") {
          const isAdmin = await requireRootAdmin(ctx);
          if (!isAdmin) return;
        } else if (cmd.scope === "manager") {
          const isManager = await requireManager(ctx);
          if (!isManager) return;
        }

        await cmd.handler(ctx);
      });
    }

    // Set command menus scoped by Telegram's BotCommandScope

    // Everyone sees only public commands
    await bot.api.setMyCommands(
      commands
        .filter((c) => c.scope === "public")
        .map((c) => ({ command: c.name, description: c.description })),
      { scope: { type: "default" } },
    );

    // Safety net
    await bot.api.setMyCommands(
      commands
        .filter((c) => c.scope === "public")
        .map((c) => ({ command: c.name, description: c.description })),
      { scope: { type: "all_private_chats" } },
    );

    // Active managers
    const managerIds = await getAllManagers();
    const managerCommands: BotCommand[] = commands
      .filter((c) => c.scope === "public" || c.scope === "manager")
      .map((c) => ({ command: c.name, description: c.description }));

    for (const chatId of managerIds) {
      await bot.api.setMyCommands(managerCommands, {
        scope: { type: "chat", chat_id: chatId },
      });
    }

    const adminId = getRootAdminChatId();
    if (adminId) {
      await bot.api.setMyCommands(
        commands.map((c) => ({ command: c.name, description: c.description })),
        { scope: { type: "chat", chat_id: adminId } },
      );
    }

    const counts = {
      public: commands.filter((c) => c.scope === "public").length,
      manager: commands.filter((c) => c.scope === "manager").length,
      admin: commands.filter((c) => c.scope === "admin").length,
    };

    console.info(
      `Commands registered: ${counts.public} public, ${counts.manager} manager, ${counts.admin} admin`,
    );
  } catch (error) {
    console.error("Failed to register commands:", error);
  }
}
