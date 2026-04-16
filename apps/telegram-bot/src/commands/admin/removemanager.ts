import { getBotManager } from "@/bot";
import { getAllManagers, removeManager } from "@/services/manager-preferences.service";
import type { TContext } from "@/types";
import { Command } from "@grammyjs/commands";
import { setCommandsForChat } from "@/commands/utils";
import { publicCommands } from "@/commands/groups";

/**
 * /removemanager <chatId>
 *
 * Marks the manager as inactive (does not delete from DB).
 *
 * Example:
 *   /removemanager 123456789
 */
export const removeManagerCommand = new Command<TContext>("removemanager", "Удалить менеджера", async (ctx) => {
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

  try {
    await removeManager(chatId);

    const bot = getBotManager().getBot();
    // Demote the removed manager's chat menu back to public commands only.
    await setCommandsForChat(bot, chatId, publicCommands);

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
});
