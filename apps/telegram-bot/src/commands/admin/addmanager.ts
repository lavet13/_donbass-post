import { getBotManager } from "@/bot";
import { addManager, getAllManagers } from "@/services/manager-preferences.service";
import type { TContext } from "@/types";
import { Command } from "@grammyjs/commands";
import { setCommandsForChat } from "@/commands/utils";
import { managerCommands, publicCommands } from "../groups";

/**
 * /addmanager <chatId> [username] [firstName] [lastName]
 *
 * Examples:
 *   /addmanager 123456789
 *   /addmanager 123456789 john_doe John Doe
 */
export const addManagerCommand = new Command<TContext>("addmanager", "Добавить менеджера", async (ctx) => {
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

  try {
    await addManager({
      chatId,
      username,
      firstName,
      lastName,
    });

    const bot = getBotManager().getBot();
    // Update the new manager's chat menu to show public + manager commands.
    // Must include publicCommands too — setMyCommands replaces, not appends.
    await setCommandsForChat(bot, chatId, publicCommands, managerCommands);

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
});
