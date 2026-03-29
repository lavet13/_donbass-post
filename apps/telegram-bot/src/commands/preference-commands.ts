import {
  NotificationTypeNames,
  type NotificationType,
} from "@/types/notification-types";
import { VALID_SLUGS, type Command } from ".";
import {
  getAllManagers,
  isManagerSubscribed,
  getManagerNotifications,
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
export const removePreferenceCommand: Command = {
  name: "removepreference",
  scope: "admin",
  description: "Удалить тип уведомления у менеджера",
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
  scope: "admin",
  description: "Добавить тип уведомлений менеджеру",
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
};

export const setPreferencesCommand: Command = {
  name: "setpreferences",
  scope: "admin",
  description: "Задать настройки уведомлений менеджера",
  handler: async (ctx) => {
    const item = ctx.match;
    console.log({ item });
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
        "❌ Неизвестные типы уведомлений:\n" +
          `${invalidSlugs.map((s) => `<code>${s}</code>`).join(", ")}\n\n` +
          "Доступные:\n" +
          VALID_SLUGS.map((s) => `  <code>${s}</code>`).join("\n"),
        { parse_mode: "HTML" },
      );
      return;
    }

    const allManagers = await getAllManagers();
    if (!allManagers.includes(chatId)) {
      await ctx.reply(
        `❌ Менеджер с Chat ID <code>${chatId}</code> не найден в базе данных.\n` +
          "Сначала добавьте его через /addmanager.",
        { parse_mode: "HTML" },
      );
      return;
    }

    try {
      await setManagerPreferences(chatId, slugs);

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
