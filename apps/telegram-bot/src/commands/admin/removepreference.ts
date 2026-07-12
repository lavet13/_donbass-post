import type { TContext } from "@/types/context";
import { Command, LanguageCodes } from "@grammyjs/commands";
import { NotificationTypeNames } from "@/notifications/notification-types";
import { prisma } from "@/prisma";
import { isNotificationSlug, resolveManagerCommand } from "@/commands/args";
import { VALID_SLUGS } from "@/commands";
import { getManagerSubscriptions } from "@/notifications/subscriptions";

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
    const USAGE =
      "❌ <b>Использование:</b>\n" +
      "<code>/removepreference &lt;chatId&gt; &lt;slug&gt;</code>\n\n" +
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
      // count === 0 wasn't subscribed. count === 1 removed subscription.
      const { count } = await prisma.notificationPreferences.deleteMany({
        where: { userId, notificationType: { slug } },
      });

      if (count > 0) {
        // reading to decide a write is the race; reading to display after a write is fine.
        // removed subscription(successfully)
        const remaining = await getManagerSubscriptions(chatId);
        const tail =
          remaining.length === 0
            ? "⚠ Менеджер больше не подписан ни на одно уведомление."
            : "Оставшиеся подписки:\n" +
              remaining
                .map((s) => `  • ${NotificationTypeNames[s]}`)
                .join("\n");

        await ctx.reply(
          `✅ Подписка на <b>${NotificationTypeNames[slug]}</b> удалена у менеджера <code>${chatId}</code>.\n\n${tail}`,
          { parse_mode: "HTML" },
        );
      } else {
        // not subscribed(warn)
        await ctx.reply(
          `⚠ Менеджер <code>${chatId}</code> не подписан на <b>${NotificationTypeNames[slug]}</b>.`,
          { parse_mode: "HTML" },
        );
        return;
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
