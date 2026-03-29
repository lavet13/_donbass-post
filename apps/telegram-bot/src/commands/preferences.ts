import type { Command } from ".";
import {
  getAllPreferences,
  getManagerNotifications,
} from "@/services/manager-preferences.service";
import { NotificationTypeNames } from "@/types/notification-types";

/**
 * /preferences — shows the calling manager their own notification subscriptions
 */
export const preferencesCommand: Command = {
  name: "preferences",
  scope: "manager",
  description: "Мои настройки уведомлений",
  handler: async (ctx) => {
    const userId = ctx.from?.id;

    if (!userId) {
      await ctx.reply("❌ Не удалось определить ваш ID");
      return;
    }

    try {
      // Get user's notification subscriptions
      const userNotifications = await getManagerNotifications(userId);

      if (userNotifications.length === 0) {
        // Manager in database but with no subscriptions
        await ctx.reply(
          "📬 <b>Ваши настройки уведомлений</b>\n\n" +
            "🔕 <b>Все уведомления отключены</b>\n\n" +
            "У вас нет активных подписок на уведомления.\n" +
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
    } catch (err) {
      console.error("Error in preferences command:", err);
      await ctx.reply(
        "❌ Произошла ошибка при получении ваших настроек. Попробуйте позже.",
      );
    }
  },
};

export const allPreferencesCommand: Command = {
  name: "allpreferences",
  scope: "admin",
  description: "Настройки всех менеджеров",
  handler: async (ctx) => {
    try {
      const allPreferences = await getAllPreferences();

      if (allPreferences.length === 0) {
        await ctx.reply(
          "<b>Менеджеры не настроены</b>\n\n" +
            "В базе данных нет активных менеджеров.\n" +
            "Используйте команду для миграции из переменных окружения.",
          { parse_mode: "HTML" },
        );
        return;
      }

      const lines: string[] = ["👥 <b>Настройки уведомлений менеджеров</b>\n"];

      if (allPreferences.length === 0) {
        lines.push("В базе данных нет менеджеров с настройками\n");
        await ctx.reply(lines.join("\n"), { parse_mode: "HTML" });
        return;
      }

      for (const [index, preference] of allPreferences.entries()) {
        lines.push(`${index + 1}. Chat ID: <code>${preference.chatId}</code>`);

        if (preference.notifications.length === 0) {
          lines.push("   └ 🔕 Все уведомления отключены");
        } else {
          lines.push("   └ Получает:");
          preference.notifications.forEach((type) => {
            lines.push(`      • ${NotificationTypeNames[type]}`);
          });
        }

        lines.push(""); // Empty line between managers
      }

      lines.push(
        "Для изменения настроек используйте команды управления менеджерами",
      );

      await ctx.reply(lines.join("\n"), { parse_mode: "HTML" });
    } catch (err) {
      console.error("Error in allpreferences command:", err);
      await ctx.reply(
        "❌ Произошла ошибка при получении настроек. Попробуйте позже.",
      );
    }
  },
};
