import { getBotManager } from "@/bot";
import { removeManager } from "@/managers/service";
import type { TContext } from "@/types/context";
import { Command, LanguageCodes } from "@grammyjs/commands";
import { setCommandsForChat } from "@/commands/utils";
import { publicCommands } from "@/commands/groups";
import { assertNever } from "@/utils/assert-never";
import { env } from "@/env";

/**
 * /removemanager <chatId>
 *
 * Marks the manager as inactive (does not delete from DB).
 *
 * Example:
 *   /removemanager 123456789
 */
export const removeManagerCommand = new Command<TContext>(
  "removemanager",
  "Удалить менеджера",
  async (ctx) => {
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

    // Prevent self-removal
    if (env.NODE_ENV === "production" && ctx.from?.id === chatId) {
      await ctx.reply("⛔ Нельзя удалить самого себя.", { parse_mode: "HTML" });
      return;
    }

    try {
      const result = await removeManager(chatId);

      switch (result) {
        case "user_not_found":
          await ctx.reply(`❌ Пользователь <code>${chatId}</code> не найден.`, {
            parse_mode: "HTML",
          });
          return;

        case "not_a_manager":
          await ctx.reply(`⚠ <code>${chatId}</code> не является менеджером.`, {
            parse_mode: "HTML",
          });
          return;

        case "revoked": {
          // Only demote the menu when something was actually revoked.
          const bot = getBotManager().getBot();
          await setCommandsForChat(bot, chatId, publicCommands);
          await ctx.reply(`✅ Менеджер <code>${chatId}</code> удалён.`, {
            parse_mode: "HTML",
          });
          return;
        }

        case "user_deactivated": {
          await ctx.reply(
            `✅ Менеджер <code>${chatId}</code> деактивирован.\n`,
            { parse_mode: "HTML" },
          );
          return;
        }

        default:
          return assertNever(result);
      }
    } catch (err) {
      console.error("Error in /removemanager:", err);
      await ctx.reply(
        "❌ Произошла ошибка при удалении менеджера. Попробуйте позже.",
      );
    }
  },
);

removeManagerCommand.localize(
  LanguageCodes.Russian,
  "removemanager",
  "Удалить менеджера",
);
removeManagerCommand.localize(
  LanguageCodes.Ukrainian,
  "removemanager",
  "Видалити менеджера",
);
removeManagerCommand.localize(
  LanguageCodes.English,
  "removemanager",
  "Remove manager",
);
