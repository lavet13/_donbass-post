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
 * /appendpreference <chatId> <slug>
 *
 * Adds a single notification type to a manager's existing preferences.
 * Unlike /setpreferences, this does NOT clear existing subscriptions.
 *
 * Examples:
 *   /appendpreference 123456789 ali-parcel-pickup
 */
export const appendPreferenceCommand = new Command<TContext>(
  "appendpreference",
  "Добавить тип уведомлений менеджеру",
  async (ctx) => {
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
      const alreadySubscribed = await isManagerSubscribed(chatId, slug);
      if (alreadySubscribed) {
        await ctx.reply(
          `⚠ Менеджер <code>${chatId}</code> уже подписан на <b>${NotificationTypeNames[slug]}</b>.`,
          { parse_mode: "HTML" },
        );
        return;
      }

      const current = await getManagerNotifications(chatId);
      await setManagerPreferences(chatId, [...current, slug]);

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
);

appendPreferenceCommand.localize(
  LanguageCodes.Russian,
  "appendpreference",
  "Добавить тип уведомлений менеджеру",
);
appendPreferenceCommand.localize(
  LanguageCodes.Ukrainian,
  "appendpreference",
  "Додати тип сповіщень менеджеру",
);
appendPreferenceCommand.localize(
  LanguageCodes.English,
  "appendpreference",
  "Add notification type to manager",
);
