import { removeManager } from "@/managers/service";
import type { TContext } from "@/types/context";
import { Command, LanguageCodes } from "@grammyjs/commands";
import { clearCommandsForChat } from "@/commands/utils";
import { assertNever } from "@/utils/assert-never";
import { parseChatId } from "../args";

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
    const chatId = parseChatId(chatIdStr);

    if (chatId === null) {
      await ctx.reply(`❌ Некорректный Chat ID: <code>${chatIdStr}</code>`, {
        parse_mode: "HTML",
      });
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
          try {
            await clearCommandsForChat(ctx.api, chatId);
          } catch (err) {
            console.error(
              `Command scope not cleared for ${chatId} (role still revoked):`,
              err,
            );
          }

          await ctx.reply(`✅ Менеджер <code>${chatId}</code> удалён.`, {
            parse_mode: "HTML",
          });
          return;
        }

        case "last_manager": {
          await ctx.reply(
            "⛔ Нельзя удалить последнего активного менеджера — уведомления будет некому получать.\n" +
              "Сначала добавьте другого через /addmanager.",
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
