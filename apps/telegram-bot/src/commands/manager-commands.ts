import { getAllManagers, addManager, removeManager } from "@/services/manager-preferences.service";
import { commands, getCommandListText, type Command } from ".";
import { prisma } from "@/prisma";
import { isActiveManager, isRootAdmin } from "@/commands/guards";
import { getBotManager } from "@/bot";
import type { BotCommand } from "grammy/types";

export const managersCommand: Command = {
  name: "managers",
  scope: "admin",
  description: "Информация о менеджерах",
  handler: async (ctx) => {
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
  scope: "admin",
  description: "Добавить менеджера",
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

    const existingManagers = await getAllManagers();

    if (existingManagers.includes(chatId)) {
      await ctx.reply(
        `⚠ Менеджер с Chat ID <code>${chatId}</code> уже существует.`,
        { parse_mode: "HTML" },
      );
      return;
    }

    const botManager = getBotManager();
    const bot = botManager.getBot();

    const managerCommands: BotCommand[] = commands
      .filter((c) => c.scope === "public" || c.scope === "manager")
      .map((c) => ({ command: c.name, description: c.description }));

    try {
      await addManager({
        chatId,
        username,
        firstName,
        lastName,
      });

      await bot.api.setMyCommands(managerCommands, {
        scope: { type: "chat", chat_id: chatId },
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
  scope: "admin",
  description: "Удалить менеджера",
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

    const existingManagers = await getAllManagers();
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

    const botManager = getBotManager();
    const bot = botManager.getBot();

    try {
      await removeManager(chatId);

      await bot.api.setMyCommands(
        commands
          .filter((c) => c.scope === "public")
          .map((c) => ({ command: c.name, description: c.description })),
        { scope: { type: "chat", chat_id: chatId } },
      );

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
