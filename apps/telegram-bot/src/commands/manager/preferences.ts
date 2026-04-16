import { getManagerNotifications } from "@/services/manager-preferences.service";
import type { TContext } from "@/types";
import { NotificationTypeNames } from "@/types/notification-types";
import { Command } from "@grammyjs/commands";

/**
 * /preferences — shows the calling manager their own notification subscriptions
 */
export const preferencesCommand = new Command<TContext>(
  "preferences",
  "Мои настройки уведомлений",
  async (ctx) => {
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
);
