import { Bot } from "grammy";
import {
  formatOnlinePickupMessage,
  formatPickUpPointDeliveryOrderMessage,
} from "@/formatters/messages";
import type {
  OnlinePickupPayload,
  PickUpPointDeliveryOrderPayload,
} from "@/types/notifications";
import {
  NotificationTypes,
  type NotificationType,
} from "@/types/notification-types";
import { getManagerPreferences } from "./manager-preferences.service";

/**
 * Result of sending notifications to managers
 */
export interface NotificationResult {
  success: boolean;
  sent: number;
  failed: number;
  skipped: number; // Managers who were skipped due to preferences
  errors: Array<{ chatId: number; error: string }>;
}

/**
 * Send a message to managers based on notification type
 *
 * This is the core function - it routes messages to managers based on their preferences.
 * The message formatting is handled by separate formatter functions.
 *
 * @param bot - Telegram bot instance
 * @param message - Formatted HTML message to send
 * @param notificationType - Type of notification to determine which managers receive it
 * @returns Statistics about the send operation
 */
export async function sendToManagers(
  bot: Bot,
  message: string,
  notificationType: NotificationType,
): Promise<NotificationResult> {
  const preferencesService = getManagerPreferences();

  const targetManagers =
    preferencesService.getManagersForNotification(notificationType);
  const allManagers = preferencesService.getAllManagers();

  if (allManagers.length === 0) {
    console.warn("⚠️ No manager chat IDs configured");
    return { success: false, sent: 0, failed: 0, skipped: 0, errors: [] };
  }

  if (targetManagers.length === 0) {
    console.warn(
      `⚠️ No managers subscribed to notification type: ${notificationType}`,
    );
    return {
      success: false,
      sent: 0,
      failed: 0,
      skipped: allManagers.length,
      errors: [],
    };
  }

  const results = await Promise.allSettled(
    targetManagers.map((chatId) =>
      bot.api.sendMessage(chatId, message, { parse_mode: "HTML" }),
    ),
  );

  const errors: Array<{ chatId: number; error: string }> = [];
  let sent = 0;
  let failed = 0;

  results.forEach((result, index) => {
    const chatId = targetManagers[index]!;

    if (result.status === "fulfilled") {
      sent++;
      console.warn(
        `✅ [${notificationType}] Notification sent to manager ${chatId}`,
      );
    } else {
      failed++;
      const error =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);

      errors.push({ chatId, error });
      console.error(
        `❌ [${notificationType}] Failed to send to manager ${chatId}: ${error}`,
      );
    }
  });

  const skipped = allManagers.length - targetManagers.length;

  if (skipped > 0) {
    console.warn(
      `ℹ️ [${notificationType}] Skipped ${skipped} managers (not subscribed)`,
    );
  }

  return {
    success: sent > 0,
    sent,
    failed,
    skipped,
    errors,
  };
}

/**
 * Send online pickup notification to all managers
 *
 * Convenience function that formats and sends in one step.
 * */
export async function notifyOnlinePickup(
  bot: Bot,
  payload: OnlinePickupPayload,
): Promise<NotificationResult> {
  const message = formatOnlinePickupMessage(payload);
  return sendToManagers(bot, message, NotificationTypes.ONLINE_PICKUP_RF);
}

/**
 * Send pick-up point delivery order notification to all managers
 *
 * Convenience function that formats and sends in one step.
 */
export async function notifyPickUpPointDeliveryOrder(
  bot: Bot,
  payload: PickUpPointDeliveryOrderPayload,
): Promise<NotificationResult> {
  const message = formatPickUpPointDeliveryOrderMessage(payload);
  return sendToManagers(bot, message, NotificationTypes.PICK_UP_POINT_DELIVERY);
}
