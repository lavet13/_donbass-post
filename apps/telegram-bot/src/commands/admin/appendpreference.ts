import type { TContext } from "@/types/context";
import { Command, LanguageCodes } from "@grammyjs/commands";
import { VALID_SLUGS } from "@/commands";
import { NotificationTypeNames } from "@/notifications/notification-types";
import { prisma } from "@/prisma";
import { isNotificationSlug, resolveManagerCommand } from "@/commands/args";
import { getManagerSubscriptions } from "@/notifications/subscriptions";

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
    const USAGE =
      "❌ <b>Использование:</b>\n" +
      "<code>/appendpreference &lt;chatId&gt; &lt;slug&gt;</code>\n\n" +
      "Доступные слаги:\n" +
      VALID_SLUGS.map(
        (s) => `<code>${s}</code> — ${NotificationTypeNames[s]}`,
      ).join("\n");

    const parsed = await resolveManagerCommand(ctx.message?.text ?? "", USAGE);
    if (!parsed.ok) {
      await ctx.reply(parsed.error, { parse_mode: "HTML" });
      return;
    }

    const { chatId, userId } = parsed;
    const [slug] = parsed.rest;
    if (!slug || !isNotificationSlug(slug)) {
      await ctx.reply(USAGE, { parse_mode: "HTML" });
      return;
    }

    try {
      const notification = await prisma.notificationType.findUnique({
        where: { slug },
      });

      if (!notification) {
        await ctx.reply("❌ Данное уведомление не найдено!", {
          parse_mode: "HTML",
        });
        return;
      }

      // count === 0 was already subscribed (warn); count === 1 newly added (success)
      const { count } = await prisma.notificationPreferences.createMany({
        data: [{ userId, notificationTypeId: notification.id }],
        skipDuplicates: true,
      });

      if (count > 0) {
        // reading to decide a write is the race; reading to display after a write is fine.
        // newly added(success)
        const current = await getManagerSubscriptions(chatId);
        await ctx.reply(
          `✅ Менеджер <code>${chatId}</code> подписан на <b>${NotificationTypeNames[slug]}</b>.\n\n` +
            "Текущие подписки:\n" +
            current.map((s) => `${NotificationTypeNames[s]}`).join("\n"),
          { parse_mode: "HTML" },
        );
      } else {
        // already subscribed(warn)
        await ctx.reply(
          `⚠ Менеджер <code>${chatId}</code> уже подписан на <b>${NotificationTypeNames[slug]}</b>.`,
          { parse_mode: "HTML" },
        );
      }
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
