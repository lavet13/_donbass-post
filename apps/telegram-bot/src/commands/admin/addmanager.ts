import { getBotManager } from "@/bot";
import { addManager } from "@/managers/service";
import type { TContext } from "@/types/context";
import { Command, LanguageCodes } from "@grammyjs/commands";
import { setCommandsForChat } from "@/commands/utils";
import { managerCommands, publicCommands } from "../groups";
import { assertNever } from "@/utils/assert-never";

/**
 * /addmanager <chatId> [username] [firstName] [lastName]
 *
 * Examples:
 *   /addmanager 123456789
 *   /addmanager 123456789 john_doe John Doe
 */
export const addManagerCommand = new Command<TContext>(
  "addmanager",
  "Добавить менеджера",
  async (ctx) => {
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

    try {
      const result = await addManager({
        chatId,
        username,
        firstName,
        lastName,
      });

      const bot = getBotManager().getBot();

      const displayName = [firstName, lastName].filter(Boolean).join(" ");
      const usernameStr = username ? ` (@${username})` : "";

      switch (result) {
        case "fresh_manager":
          // Update the new manager's chat menu to show public + manager commands.
          await setCommandsForChat(
            bot,
            chatId,
            publicCommands,
            managerCommands,
          );
          await ctx.reply(
            `✅ Менеджер добавлен:\n\n` +
              `Chat ID: <code>${chatId}</code>\n` +
              (displayName ? `Имя: ${displayName}${usernameStr}\n` : "") +
              `\nУведомления не настроены. Используйте:\n` +
              `<code>/setpreferences ${chatId} &lt;slug1&gt; [slug2 ...]</code>`,
            { parse_mode: "HTML" },
          );
          return;
        case "manager_role_not_found":
          await ctx.reply(`❌ Не найдена роль <b>Менеджер</b>`, {
            parse_mode: "HTML",
          });
          return;
        case "reactivated_manager":
          await ctx.reply(
            `❕ Реактивирована роль менеджера` +
              `Chat ID: <code>${chatId}</code>\n` +
              (displayName ? `Имя: ${displayName}${usernameStr}\n` : ""),
            { parse_mode: "HTML" },
          );
          return;
        case "already_manager":
          await ctx.reply(
            `❕Пользователю уже присвоен статус менеджера` +
              `Chat ID: <code>${chatId}</code>\n` +
              (displayName ? `Имя: ${displayName}${usernameStr}\n` : ""),
            { parse_mode: "HTML" },
          );
          return;

        default:
          return assertNever(result);
      }
    } catch (err) {
      console.error("Error in /addmanager:", err);
      await ctx.reply(
        "❌ Произошла ошибка при добавлении менеджера. Попробуйте позже.",
      );
    }
  },
);

addManagerCommand.localize(
  LanguageCodes.Russian,
  "addmanager",
  "Добавить менеджера",
);
addManagerCommand.localize(
  LanguageCodes.Ukrainian,
  "addmanager",
  "Додати менеджера",
);
addManagerCommand.localize(LanguageCodes.English, "addmanager", "Add manager");
