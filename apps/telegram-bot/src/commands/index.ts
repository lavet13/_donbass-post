import { config } from "@/config";
import type { Bot, Context } from "grammy";
import { preferencesCommand, allPreferencesCommand } from "./preferences";
import { prisma } from "@/prisma";
import {
  NotificationTypeNames,
  NotificationTypes,
  type NotificationType,
} from "@/types/notification-types";
import { getManagerPreferences } from "@/services/manager-preferences.service";
import { version } from "../../package.json";

const VALID_SLUGS = Object.values(NotificationTypes);

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
        `🤖 <b>Версия:</b> ${version}\n` +
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

      return `${index + 1}: Chat ID: <code>${user.chatId}</code>`;
    }).join("\n");

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

export const setPreferencesCommand: Command = {
  name: "setpreferences",
  description: "Задать настройки уведомлений менеджера",
  adminOnly: true,
  handler: async (ctx) => {
    const text = ctx.message?.text ?? "";
    // e.g. "/setpreferences 123456789 online-pickup-rf pick-up-point-delivery-order"
    const parts = text.trim().split(/\s+/).slice(1);
    if (parts.length < 2) {
      await ctx.reply(
        "❌ <b>Использование:</b>\n" +
          "<code>/setpreferences &lt;chatId&gt; [slug1 slug2 ...]</code>\n\n" +
          "Доступные типы уведомлений:\n" +
          VALID_SLUGS.map(
            (s) => `<code>${s}</code> — ${NotificationTypeNames[s]}`,
          ).join("\n") +
          "\n\nЧтобы <b>снять все</b> подписки — укажите только chatId без слагов.",
        { parse_mode: "HTML" },
      );
      return;
    }

    const [chatIdStr, ...slugs] = parts as [string, ...NotificationType[]];
    const chatId = parseInt(chatIdStr, 10);

    if (isNaN(chatId)) {
      await ctx.reply(`❌ Некорректный Chat ID: <code>${chatIdStr}</code>`, {
        parse_mode: "HTML",
      });
      return;
    }

    const invalidSlugs = slugs.filter((s) => !VALID_SLUGS.includes(s));
    if (invalidSlugs.length > 0) {
      await ctx.reply(
        `❌ Неизвестные типы уведомлений:
          ${invalidSlugs.map((s) => `<code>${s}</code>`).join(", ")}\n\n` +
          "Доступные:\n" +
          VALID_SLUGS.map((s) => `  <code>${s}</code>`).join("\n"),
        { parse_mode: "HTML" },
      );
      return;
    }

    const service = getManagerPreferences();
    const allManagers = await service.getAllManagers();
    if (!allManagers.includes(chatId)) {
      await ctx.reply(
        `❌ Менеджер с Chat ID <code>${chatId}</code> не найден в базе данных.\n` +
          "Сначала добавьте его через /addmanager.",
        { parse_mode: "HTML" },
      );
      return;
    }

    try {
      await service.setManagerPreferences(chatId, slugs);

      if (slugs.length === 0) {
        await ctx.reply(
          `✅ Все подписки для менеджера <code>${chatId}</code> сняты.`,
          { parse_mode: "HTML" },
        );
      } else {
        const list = slugs
          .map((s) => `  ${NotificationTypeNames[s]}`)
          .join("\n");

        await ctx.reply(
          `✅ Настройки менеджера <code>${chatId}</code> обновлены:\n\n${list}`,
          { parse_mode: "HTML" },
        );
      }
    } catch (err) {
      console.error(`Error in /setpreferences:`, err);
      await ctx.reply(
        `❌ Произошла ошибка при обновлении настроек. Попробуйте позже.`,
      );
    }
  },
};

/**
 * /appendpreference <chatId> <slug>
 *
 * Adds a single notification type to a manager's existing preferences.
 * Unlike /setpreferences, this does NOT clear existing subscriptions.
 *
 * Examples:
 *   /appendpreference 123456789 ali-parcel-pickup
 */
export const appendPreferenceCommand: Command = {
  name: "appendpreference",
  description: "Добавить тип уведомлений менеджеру",
  adminOnly: true,
  handler: async (ctx) => {
    const text = ctx.message?.text ?? "";
    const parts = text.trim().split(/\s+/).slice(1); // drop /appendpreference

    if (parts.length < 2) {
      await ctx.reply(
        "❌ <b>Использование:</b>\n" +
          "<code>/appendpreference &lt;chatId&gt; &lt;slug&gt;</code>\n\n" +
          "Доступные слаги:\n" +
          VALID_SLUGS.map(
            (s) => `<code>${s}</code> — ${NotificationTypeNames[s]}`,
          ).join("\n"),
        { parse_mode: "HTML" },
      );
      return;
    }

    const [chatIdStr, slug] = parts as [string, NotificationType];
    const chatId = parseInt(chatIdStr, 10);

    if (isNaN(chatId)) {
      await ctx.reply(`❌ Некорректный Chat ID: <code>${chatIdStr}</code>`, {
        parse_mode: "HTML",
      });
      return;
    }

    if (!VALID_SLUGS.includes(slug as NotificationType)) {
      await ctx.reply(
        `❌ Неизвестный слаг: <code>${slug}</code>\n\n` +
          "Доступные:\n" +
          VALID_SLUGS.map((s) => `<code>${s}</code>`).join("\n"),
        { parse_mode: "HTML" },
      );
      return;
    }

    const service = getManagerPreferences();

    const allManagers = await service.getAllManagers();
    if (!allManagers.includes(chatId)) {
      await ctx.reply(
        `❌ Менеджер с Chat ID <code>${chatId}</code> не найден.\n` +
          "Сначала добавьте его через /addmanager.",
        { parse_mode: "HTML" },
      );
      return;
    }

    try {
      const alreadySubscribed = await service.isManagerSubscribed(
        chatId,
        slug,
      );
      if (alreadySubscribed) {
        await ctx.reply(
          `⚠ Менеджер <code>${chatId}</code> уже подписан на <b>${NotificationTypeNames[slug]}</b>.`,
          { parse_mode: "HTML" },
        );
        return;
      }

      const current = await service.getManagerNotifications(chatId);
      await service.setManagerPreferences(chatId, [...current, slug]);

      await ctx.reply(
        `✅ Менеджер <code>${chatId}</code> подписан на <b>${NotificationTypeNames[slug]}</b>.\n\n` +
          "Текущие подписки:\n" +
          [...current, slug]
            .map((s) => `${NotificationTypeNames[s]}`)
            .join("\n"),
        { parse_mode: "HTML" },
      );
    } catch (err) {
      console.error("Error in /appendpreference:", err);
      await ctx.reply("❌ Произошла ошибка. Попробуйте позже.");
    }
  },
};

/**
 * /removepreference <chatId> <slug>
 *
 * Removes a single notification type from a manager's existing preferences.
 * Unlike /setpreferences, this does NOT touch other subscriptions.
 *
 * Examples:
 *   /removepreference 123456789 ali-parcel-pickup
 */
export const removePreferenceCommand: Command = {
  name: "removepreference",
  description: "Удалить тип уведомления у менеджера",
  adminOnly: true,
  handler: async (ctx) => {
    const text = ctx.message?.text ?? "";
    const parts = text.trim().split(/\s+/).slice(1);

    if (parts.length < 2) {
      await ctx.reply(
        "❌ <b>Использование:</b>\n" +
          "<code>/removepreference &lt;chatId&gt; &lt;slug&gt;</code>\n\n" +
          "Доступные слаги:\n" +
          VALID_SLUGS.map(
            (s) => `  • <code>${s}</code> — ${NotificationTypeNames[s]}`,
          ).join("\n"),
        { parse_mode: "HTML" },
      );
      return;
    }

    const [chatIdStr, slug] = parts as [string, NotificationType];
    const chatId = parseInt(chatIdStr!, 10);

    if (isNaN(chatId)) {
      await ctx.reply(`❌ Некорректный Chat ID: <code>${chatIdStr}</code>`, {
        parse_mode: "HTML",
      });
      return;
    }

    if (!VALID_SLUGS.includes(slug as NotificationType)) {
      await ctx.reply(
        `❌ Неизвестный слаг: <code>${slug}</code>\n\n` +
          "Доступные:\n" +
          VALID_SLUGS.map((s) => `  • <code>${s}</code>`).join("\n"),
        { parse_mode: "HTML" },
      );
      return;
    }

    const service = getManagerPreferences();

    const allManagers = await service.getAllManagers();
    if (!allManagers.includes(chatId)) {
      await ctx.reply(
        `❌ Менеджер с Chat ID <code>${chatId}</code> не найден.\n` +
          "Сначала добавьте его через /addmanager.",
        { parse_mode: "HTML" },
      );
      return;
    }

    try {
      const isSubscribed = await service.isManagerSubscribed(chatId, slug);
      if (!isSubscribed) {
        await ctx.reply(
          `⚠ Менеджер <code>${chatId}</code> не подписан на <b>${NotificationTypeNames[slug]}</b>.`,
          { parse_mode: "HTML" },
        );
        return;
      }

      const current = await service.getManagerNotifications(chatId);
      const updated = current.filter((s) => s !== slug);
      await service.setManagerPreferences(chatId, updated);

      if (updated.length === 0) {
        await ctx.reply(
          `✅ Подписка на <b>${NotificationTypeNames[slug]}</b> удалена у менеджера <code>${chatId}</code>.\n\n` +
            "⚠ Менеджер больше не подписан ни на одно уведомление.",
          { parse_mode: "HTML" },
        );
      } else {
        await ctx.reply(
          `✅ Подписка на <b>${NotificationTypeNames[slug]}</b> удалена у менеджера <code>${chatId}</code>.\n\n` +
            "Оставшиеся подписки:\n" +
            updated.map((s) => `  • ${NotificationTypeNames[s]}`).join("\n"),
          { parse_mode: "HTML" },
        );
      }
    } catch (err) {
      console.error("Error in /removepreference:", err);
      await ctx.reply("❌ Произошла ошибка. Попробуйте позже.");
    }
  },
};

/**
 * /addmanager <chatId> [username] [firstName] [lastName]
 *
 * Examples:
 *   /addmanager 123456789
 *   /addmanager 123456789 john_doe John Doe
 */
export const addManagerCommand: Command = {
  name: "addmanager",
  description: "Добавить менеджера",
  adminOnly: true,
  handler: async (ctx) => {
    const text = ctx.message?.text ?? "";
    const parts = text.trim().split(/\s+/).slice(1); // drop "/addmanager"

    if (parts.length === 0) {
      await ctx.reply(
        "❌ <b>Использование:</b>\n" +
          "<code>/addmanager &lt;chatId&gt; [username] [firstName] [lastName]</code>\n\n" +
          "Примеры:\n" +
          "<code>/addmanager 123456789</code>\n" +
          "<code>/addmanager 123456789 john_doe John Doe</code>",
        { parse_mode: "HTML" },
      );
      return;
    }

    const [chatIdStr, username, firstName, lastName] = parts as [
      string,
      string,
      string,
      string,
    ];

    const chatId = parseInt(chatIdStr, 10);

    if (isNaN(chatId)) {
      await ctx.reply(`❌ Некорректный Chat ID: <code>${chatIdStr}</code>`, {
        parse_mode: "HTML",
      });
      return;
    }

    const service = getManagerPreferences();

    const existingManagers = await service.getAllManagers();

    if (existingManagers.includes(chatId)) {
      await ctx.reply(
        `⚠ Менеджер с Chat ID <code>${chatId}</code> уже существует.`,
        { parse_mode: "HTML" },
      );
      return;
    }

    try {
      await service.addManager({
        chatId,
        username,
        firstName,
        lastName,
      });

      const displayName = [firstName, lastName].filter(Boolean).join(" ");
      const usernameStr = username ? ` (@${username})` : "";

      await ctx.reply(
        `✅ Менеджер добавлен:\n\n` +
          `Chat ID: <code>${chatId}</code>\n` +
          (displayName ? `Имя: ${displayName}${usernameStr}\n` : "") +
          `\nУведомления не настроены. Используйте:\n` +
          `<code>/setpreferences ${chatId} &lt;slug1&gt; [slug2 ...]</code>`,
        { parse_mode: "HTML" },
      );
    } catch (err) {
      console.error("Error in /addmanager:", err);
      await ctx.reply(
        "❌ Произошла ошибка при добавлении менеджера. Попробуйте позже.",
      );
    }
  },
};

/**
 * /removemanager <chatId>
 *
 * Marks the manager as inactive (does not delete from DB).
 *
 * Example:
 *   /removemanager 123456789
 */
export const removeManagerCommand: Command = {
  name: "removemanager",
  description: "Удалить менеджера",
  adminOnly: true,
  handler: async (ctx) => {
    const text = ctx.message?.text ?? "";
    const parts = text.trim().split(/\s+/).slice(1); // drop "/removemanager"

    if (parts.length === 0) {
      await ctx.reply(
        "❌ <b>Использование:</b>\n" +
          "<code>/removemanager &lt;chatId&gt;</code>\n\n" +
          "Пример:\n" +
          "<code>/removemanager 123456789</code>",
        { parse_mode: "HTML" },
      );
      return;
    }

    const [chatIdStr] = parts as [string];
    const chatId = parseInt(chatIdStr, 10);

    if (isNaN(chatId)) {
      await ctx.reply(`❌ Некорректный Chat ID: <code>${chatIdStr}</code>`, {
        parse_mode: "HTML",
      });
      return;
    }

    const service = getManagerPreferences();

    const existingManagers = await service.getAllManagers();
    if (!existingManagers) {
      await ctx.reply(
        `❌ Активный менеджер с Chat ID <code>${chatId}</code> не найден.`,
        { parse_mode: "HTML" },
      );
      return;
    }

    // Prevent self-removal
    if (ctx.from?.id === chatId) {
      await ctx.reply("⛔ Нельзя удалить самого себя.", { parse_mode: "HTML" });
      return;
    }

    try {
      await service.removeManager(chatId);

      await ctx.reply(
        `✅ Менеджер <code>${chatId}</code> деактивирован.\n\n` +
          `Данные сохранены в базе. Для полного удаления обратитесь к администратору БД.`,
        { parse_mode: "HTML" },
      );
    } catch (err) {
      console.error("Error in /removemanager:", err);
      await ctx.reply(
        "❌ Произошла ошибка при удалении менеджера. Попробуйте позже.",
      );
    }
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
  addManagerCommand,
  removeManagerCommand,
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
    if (ctx.callbackQuery) {
      await ctx.answerCallbackQuery({
        text: "Ошибка при попытке найти менеджера 😥",
      });
    } else {
      await ctx.reply("❌ Ошибка при проверке доступа. Попробуйте позже.");
    }

    return false;
  }
}

function getCommandListText(isAdmin: boolean = false): string {
  const relevantCommands = commands.filter((cmd) => !cmd.adminOnly || isAdmin);

  if (relevantCommands.length === 0) return "Команд пока нет 😔";

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
