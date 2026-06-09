import type { TContext } from "@/types/context";
import { Command, LanguageCodes } from "@grammyjs/commands";
import { VALID_SLUGS } from "..";
import {
  NotificationTypeNames,
  type NotificationType,
} from "@/types/notification-types";
import {
  getAllManagers,
  getManagerNotifications,
  isManagerSubscribed,
  setManagerPreferences,
} from "@/services/manager-preferences.service";

/**
 * /removepreference <chatId> <slug>
 *
 * Removes a single notification type from a manager's existing preferences.
 * Unlike /setpreferences, this does NOT touch other subscriptions.
 *
 * Examples:
 *   /removepreference 123456789 ali-parcel-pickup
 */
export const removePreferenceCommand = new Command<TContext>(
  "removepreference",
  "Удалить тип уведомления у менеджера",
  async (ctx) => {
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

    const allManagers = await getAllManagers();
    if (!allManagers.includes(chatId)) {
      await ctx.reply(
        `❌ Менеджер с Chat ID <code>${chatId}</code> не найден.\n` +
          "Сначала добавьте его через /addmanager.",
        { parse_mode: "HTML" },
      );
      return;
    }

    try {
      const isSubscribed = await isManagerSubscribed(chatId, slug);
      if (!isSubscribed) {
        await ctx.reply(
          `⚠ Менеджер <code>${chatId}</code> не подписан на <b>${NotificationTypeNames[slug]}</b>.`,
          { parse_mode: "HTML" },
        );
        return;
      }

      const current = await getManagerNotifications(chatId);
      const updated = current.filter((s) => s !== slug);
      await setManagerPreferences(chatId, updated);

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
);

removePreferenceCommand.localize(
  LanguageCodes.Russian,
  "removepreference",
  "Удалить тип уведомления у менеджера",
);
removePreferenceCommand.localize(
  LanguageCodes.Ukrainian,
  "removepreference",
  "Видалити тип сповіщення у менеджера",
);
removePreferenceCommand.localize(
  LanguageCodes.English,
  "removepreference",
  "Remove notification type from manager",
);
