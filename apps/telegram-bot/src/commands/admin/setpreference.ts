import type { TContext } from "@/types/context";
import { Command, LanguageCodes } from "@grammyjs/commands";
import { VALID_SLUGS } from "@/commands";
import { NotificationTypeNames } from "@/notifications/notification-types";
import {
  setManagerSubscriptions,
  subscriptionErrorReply,
} from "@/notifications/subscriptions";
import { isNotificationSlug, resolveManagerCommand } from "@/commands/args";

export const setPreferenceCommand = new Command<TContext>(
  "setpreferences",
  "Задать настройки уведомлений менеджера",
  async (ctx) => {
    // e.g. "/setpreferences 123456789 online-pickup-rf pick-up-point-delivery-order"
    const USAGE =
      "❌ <b>Использование:</b>\n" +
      "<code>/setpreferences &lt;chatId&gt; [slug1 slug2 ...]</code>\n\n" +
      "Доступные типы уведомлений:\n" +
      VALID_SLUGS.map(
        (s) => `<code>${s}</code> — ${NotificationTypeNames[s]}`,
      ).join("\n") +
      "\n\nЧтобы <b>снять все</b> подписки — укажите только chatId без слагов.";

    const parsed = await resolveManagerCommand(ctx.message?.text ?? "", USAGE);
    if (!parsed.ok) {
      await ctx.reply(parsed.error, { parse_mode: "HTML" });
      return;
    }

    const { chatId } = parsed;
    const valid = parsed.rest.filter(isNotificationSlug);
    if (valid.length !== parsed.rest.length) {
      const invalid = parsed.rest.filter((s) => !isNotificationSlug(s));
      await ctx.reply(
        `❌ Неизвестные типы: ${invalid.map((s) => `<code>${s}</code>`).join(", ")}`,
        {
          parse_mode: "HTML",
        },
      );
      return;
    }

    try {
      const result = await setManagerSubscriptions(chatId, valid);
      const errorReply = subscriptionErrorReply(result);
      if (errorReply) {
        await ctx.reply(errorReply, { parse_mode: "HTML" });
        return;
      }

      if (valid.length === 0) {
        await ctx.reply(
          `✅ Все подписки для менеджера <code>${chatId}</code> сняты.`,
          { parse_mode: "HTML" },
        );
      } else {
        const list = valid
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
