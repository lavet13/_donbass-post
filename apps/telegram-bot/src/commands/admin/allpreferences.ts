import { getAllManagerSubscriptions } from "@/notifications/subscriptions";
import type { TContext } from "@/types/context";
import { NotificationTypeNames } from "@/notifications/notification-types";
import { Command, LanguageCodes } from "@grammyjs/commands";

export const allPreferencesCommand = new Command<TContext>(
  "allpreferences",
  "Настройки всех менеджеров",
  async (ctx) => {
    try {
      const allSubscriptions = await getAllManagerSubscriptions();

      if (allSubscriptions.length === 0) {
        await ctx.reply(
          "<b>Менеджеры не настроены</b>\n\n" +
            "В базе данных нет активных менеджеров.\n" +
            "Используйте команду для миграции из переменных окружения.",
          { parse_mode: "HTML" },
        );
        return;
      }

      const lines: string[] = ["👥 <b>Настройки уведомлений менеджеров</b>\n"];

      if (allSubscriptions.length === 0) {
        lines.push("В базе данных нет менеджеров с настройками\n");
        await ctx.reply(lines.join("\n"), { parse_mode: "HTML" });
        return;
      }

      for (const [index, preference] of allSubscriptions.entries()) {
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
);

allPreferencesCommand.localize(
  LanguageCodes.Russian,
  "allpreferences",
  "Настройки всех менеджеров",
);
allPreferencesCommand.localize(
  LanguageCodes.Ukrainian,
  "allpreferences",
  "Налаштування всіх менеджерів",
);
allPreferencesCommand.localize(
  LanguageCodes.English,
  "allpreferences",
  "All manager settings",
);
