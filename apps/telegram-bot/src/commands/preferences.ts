import type { Command } from ".";
import { isCurrentUserManager } from ".";
import { getManagerPreferences } from "@/services/manager-preferences.service";
import { NotificationTypeNames } from "@/types/notification-types";

export const preferencesCommand: Command = {
  name: "preferences",
  description: "Мои настройки уведомлений",
  handler: async (ctx) => {
    const userId = ctx.from?.id;

    if (!userId) {
      await ctx.reply("❌ Не удалось определить ваш ID");
      return;
    }

    const isManager = isCurrentUserManager(ctx);

    if (!isManager) {
      await ctx.reply("⛔ Эта команда только для менеджеров.");
      return;
    }

    const preferencesService = getManagerPreferences();

    // Check if preferences system is configured at all
    const hasPreferencesSystem =
      preferencesService.getAllPreferences().length > 0;

    if (!hasPreferencesSystem) {
      // No MANAGER_NOTIFICATION_PREFERENCES set - backward compatible mode
      await ctx.reply(
        "📬 <b>Ваши настройки уведомлений</b>\n\n" +
          "Вы получаете <b>все типы уведомлений</b>.\n\n" +
          "⚠️ Настройки MANAGER_NOTIFICATION_PREFERENCES не заданы.\n" +
          "Чтобы настроить избирательную доставку, обратитесь к администратору.",
        { parse_mode: "HTML" },
      );
      return;
    }

    // Preferences system is configured - check if this manager is in it
    const userNotifications =
      preferencesService.getManagerNotifications(userId);
    const isInPreferences = preferencesService
      .getAllPreferences()
      .some((p) => p.chatId === userId);

    if (!isInPreferences) {
      // Manager not in preferences config (opted out)
      await ctx.reply(
        "📬 <b>Ваши настройки уведомлений</b>\n\n" +
          "🔕 <b>Уведомления отключены</b>\n\n" +
          "Вы не получаете никаких уведомлений, так как не указаны в настройках.\n" +
          "Чтобы изменить настройки, обратитесь к администратору.",
        { parse_mode: "HTML" },
      );
      return;
    }

    if (userNotifications.length === 0) {
      // Manager in preferences but with empty array (explicitly disabled all)
      await ctx.reply(
        "📬 <b>Ваши настройки уведомлений</b>\n\n" +
          "🔕 <b>Все уведомления отключены</b>\n\n" +
          "Вы явно отключили все типы уведомлений.\n" +
          "Чтобы изменить настройки, обратитесь к администратору.",
        { parse_mode: "HTML" },
      );
      return;
    }

    // Manager has specific subscriptions
    const notificationList = userNotifications
      .map((type) => `  • ${NotificationTypeNames[type]}`)
      .join("\n");

    await ctx.reply(
      "📬 <b>Ваши настройки уведомлений</b>\n\n" +
        "Вы получаете следующие типы уведомлений:\n\n" +
        notificationList +
        "\n\nЧтобы изменить настройки, обратитесь к администратору.",
      { parse_mode: "HTML" },
    );
  },
};

export const allPreferencesCommand: Command = {
  name: "allpreferences",
  description: "Настройки всех менеджеров",
  adminOnly: true,
  handler: async (ctx) => {
    const preferencesService = getManagerPreferences();
    const allManagerIds = preferencesService.getAllManagers();

    if (allManagerIds.length === 0) {
      await ctx.reply(
        "⚠️ <b>Менеджеры не настроены</b>\n\n" +
          "Установите переменную окружения MANAGER_CHAT_IDS",
        { parse_mode: "HTML" },
      );
      return;
    }

    const lines: string[] = ["👥 <b>Настройки уведомлений менеджеров</b>\n"];

    const allPreferences = preferencesService.getAllPreferences();
    const hasPreferencesSystem = allPreferences.length > 0;

    if (!hasPreferencesSystem) {
      // No MANAGER_NOTIFICATION_PREFERENCES set - show all managers as "get everything"
      lines.push("⚠️ MANAGER_NOTIFICATION_PREFERENCES не задан\n");
      lines.push("<b>Все менеджеры получают все уведомления:</b>\n");

      allManagerIds.forEach((chatId, index) => {
        lines.push(`${index + 1}. Chat ID: <code>${chatId}</code>`);
        lines.push("   └ ✅ Получает все уведомления (режим по умолчанию)");
        lines.push(""); // Empty line
      });

      lines.push(
        "ℹ️ Чтобы настроить уведомления для каждого менеджера, установите MANAGER_NOTIFICATION_PREFERENCES",
      );

      await ctx.reply(lines.join("\n"), { parse_mode: "HTML" });
      return;
    }

    // Preferences system is configured - show detailed status
    const managersInPreferences = new Set(allPreferences.map((p) => p.chatId));
    const managersWithoutPrefs = allManagerIds.filter(
      (id) => !managersInPreferences.has(id),
    );

    // Display managers with preferences
    if (allPreferences.length > 0) {
      lines.push("<b>Менеджеры с настройками:</b>\n");

      allPreferences.forEach((pref, index) => {
        lines.push(`${index + 1}. Chat ID: <code>${pref.chatId}</code>`);

        if (pref.notifications.length === 0) {
          lines.push("   └ 🔕 Все уведомления отключены");
        } else {
          lines.push("   └ Получает:");
          pref.notifications.forEach((type) => {
            lines.push(`      • ${NotificationTypeNames[type]}`);
          });
        }

        lines.push(""); // Empty line between managers
      });
    }

    // Display managers without preferences (opted out)
    if (managersWithoutPrefs.length > 0) {
      lines.push("<b>Менеджеры без настроек (не получают уведомления):</b>\n");
      managersWithoutPrefs.forEach((chatId, index) => {
        lines.push(
          `${allPreferences.length + index + 1}. Chat ID: <code>${chatId}</code>`,
        );
        lines.push("   └ 🔕 Не указан в настройках (отключено)");
        lines.push(""); // Empty line
      });
    }

    lines.push(
      "ℹ️ Для изменения настроек отредактируйте переменную окружения MANAGER_NOTIFICATION_PREFERENCES",
    );

    await ctx.reply(lines.join("\n"), { parse_mode: "HTML" });
  },
};
