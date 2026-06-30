import type { TContext } from "@/types/context";
import { Command, LanguageCodes } from "@grammyjs/commands";
import { VALID_SLUGS } from "@/commands";
import {
  NotificationTypeNames,
  type NotificationType,
} from "@/notifications/notification-types";
import { getAllManagers } from "@/managers/service";
import { setManagerSubscriptions } from "@/notifications/subscriptions";

export const setPreferenceCommand = new Command<TContext>(
  "setpreferences",
  "Задать настройки уведомлений менеджера",
  async (ctx) => {
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
      await setManagerSubscriptions(chatId, slugs);

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
);

setPreferenceCommand.localize(
  LanguageCodes.Russian,
  "setpreferences",
  "Задать настройки уведомлений менеджера",
);
setPreferenceCommand.localize(
  LanguageCodes.Ukrainian,
  "setpreferences",
  "Задати налаштування сповіщень менеджера",
);
setPreferenceCommand.localize(
  LanguageCodes.English,
  "setpreferences",
  "Set manager notification settings",
);
