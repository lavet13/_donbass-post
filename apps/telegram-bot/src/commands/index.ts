import { config } from "@/config";
import type { Bot, Context } from "grammy";
import { preferencesCommand, allPreferencesCommand } from "./preferences";
import { prisma } from "@/prisma";

export type CommandHandler = (ctx: Context) => Promise<void>;

export interface Command {
  name: string;
  description: string;
  handler: CommandHandler;
  adminOnly?: boolean;
}

export const startCommand: Command = {
  name: "start",
  description: "Начать работу с ботом",
  handler: async (ctx) => {
    const username = ctx.from?.first_name || "пользователь";
    const isManager = await isCurrentUserManager(ctx);

    await ctx.reply(
      `👋 Привет ${username}! Я бот <b>Нашей Почты</b>.\n\n` +
        "Я помогаю обрабатывать заявки и уведомления.\n\n" +
        getCommandListText(isManager),
      { parse_mode: "HTML" },
    );
  },
};

export const helpCommand: Command = {
  name: "help",
  description: "Помощь",
  handler: async (ctx) => {
    const isManager = await isCurrentUserManager(ctx);

    await ctx.reply(
      "ℹ️ <b>Помощь</b>\n\n" +
        "Этот бот используется для обработки заявок на доставку.\n\n" +
        getCommandListText(isManager),
      { parse_mode: "HTML" },
    );
  },
};

export const statusCommand: Command = {
  name: "status",
  description: "Показать статус бота",
  adminOnly: true,
  handler: async (ctx) => {
    const uptime = Math.floor(process.uptime());
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);

    const managerCount = config.managers.getChatIds().length;

    const isManager = await isCurrentUserManager(ctx);

    await ctx.reply(
      "✅ <b>Статус бота</b>\n\n" +
        `⏱ <b>Время работы:</b> ${hours}ч ${minutes}м ${seconds}с\n` +
        `🤖 <b>Версия:</b> 1.0.0\n` +
        `📡 <b>Режим:</b> ${config.telegram.useWebhook ? "webhook" : "polling"}\n` +
        `💾 <b>Память:</b> ${heapUsedMB} / ${heapTotalMB} MB\n` +
        `👥 <b>Менеджеров:</b> ${managerCount}\n` +
        `🌍 <b>Окружение:</b> ${config.server.nodeEnv}\n\n` +
        getCommandListText(isManager),
      { parse_mode: "HTML" },
    );
  },
};

export const managersCommand: Command = {
  name: "managers",
  description: "Информация о менеджерах",
  adminOnly: true,
  handler: async (ctx) => {
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
          "Установите переменную окружения MANAGER_CHAT_IDS",
        { parse_mode: "HTML" },
      );
      return;
    }

    const isManager = await isCurrentUserManager(ctx);

    const managerList = managers.map((manager, index) => {
      const user = manager.telegramUser;
      const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
      const username = user.username ? `@${user.username}` : "";
      const displayName = name || username || `Chat ID: ${user.chatId}`;

      return `${index + 1}: ${displayName}\n   └ Chat ID: <code>${user.chatId}</code>\n`;
    });

    await ctx.reply(
      `👥 <b>Список менеджеров</b>\n\n` +
        `Всего менеджеров: ${managers.length}\n\n` +
        `${managerList}\n\n` +
        getCommandListText(isManager),
      { parse_mode: "HTML" },
    );
  },
};

export const getChatIdCommand: Command = {
  name: "getchatid",
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
];

export async function isCurrentUserManager(ctx: Context): Promise<boolean> {
  const userId = ctx.from?.id;
  if (!userId) return false;

  try {
    const telegramUser = await prisma.telegramUser.findUnique({
      where: {
        chatId: BigInt(userId),
      },
      include: {
        managerProfile: true,
      },
    });

    return !!(telegramUser?.isActive && telegramUser.managerProfile);
  } catch (err) {
    console.error(`Error checking manager status: ${err}`);
    return false;
  }
}

function getCommandListText(isAdmin: boolean = false): string {
  const relevantCommands = commands.filter((cmd) => !cmd.adminOnly || isAdmin);

  if (relevantCommands.length === 0) return "Комманд пока нет 😔";

  const lines = relevantCommands.map(
    (cmd) => `/${cmd.name} - ${cmd.description}`,
  );

  return "Доступные команды:\n" + lines.join("\n");
}

export async function registerCommands(bot: Bot) {
  if (!bot) return;

  try {
    // 1. Register handlers for all commands
    for (const cmd of commands) {
      if (cmd.adminOnly) {
        bot.command(cmd.name, async (ctx) => {
          const isManager = isCurrentUserManager(ctx);

          if (!isManager) {
            await ctx.reply("⛔ Эта команда только для менеджеров.");
            return;
          }

          await cmd.handler(ctx);
        });
      } else {
        bot.command(cmd.name, cmd.handler);
      }
    }

    // 2. Prepare list of commands visible in BotFather / command menu
    const publicCommands = commands
      .filter((cmd) => !cmd.adminOnly)
      .map((cmd) => ({
        command: cmd.name,
        description: cmd.description,
      }));

    await bot.api.setMyCommands(publicCommands);

    console.info(
      `Registered ${publicCommands.length} public commands + ${Math.abs(commands.length - publicCommands.length)} admin commands`,
    );
  } catch (error) {
    console.error("Failed to register commands:", error);
  }
}
