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
import { prisma } from "@/prisma";

/**
 * Result of sending notifications to managers
 */
export interface NotificationResult {
  success: boolean;
  sent: number;
  failed: number;
  skipped: number; // Managers who were skipped due to preferences
  errors: Array<{ chatId: number; errorMessage: string }>;
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
 * @param payload - Optional payload to log
 * @returns Statistics about the send operation
 */
export async function sendToManagers(
  bot: Bot,
  message: string,
  notificationType: NotificationType,
  payload?: any,
): Promise<NotificationResult> {
  const preferencesService = getManagerPreferences();

  const targetManagers =
    await preferencesService.getManagersForNotification(notificationType);
  const allManagers = await preferencesService.getAllManagers();

  if (allManagers.length === 0) {
    console.warn("No manager chat IDs configured");
    return { success: false, sent: 0, failed: 0, skipped: 0, errors: [] };
  }

  if (targetManagers.length === 0) {
    console.warn(
      `No managers subscribed to notification type: ${notificationType}`,
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
    targetManagers.map(async (chatId) => {
      // Log successful notification
      try {
        await bot.api.sendMessage(chatId, message, { parse_mode: "HTML" });

        try {
          await prisma.notificationLog.create({
            data: {
              managerChatId: BigInt(chatId),
              notificationType,
              payload: payload || null,
              success: true,
              errorMessage: null,
            },
          });
        } catch (logErr) {
          console.error(
            `Sent OK to ${chatId} but logging success failed:`,
            logErr,
          );
        }

        return { chatId, success: true } as const;
      } catch (sendErr) {
        const errorMessage =
          sendErr instanceof Error ? sendErr.message : String(sendErr);

        try {
          await prisma.notificationLog.create({
            data: {
              managerChatId: BigInt(chatId),
              success: false,
              errorMessage,
              payload: payload || null,
              notificationType,
            },
          });
        } catch (logErr) {
          console.error(
            `Failed to send to ${chatId} and also failed to log it:`,
            logErr,
          );
        }

        throw sendErr;
      }
    }),
  );

  const errors: NotificationResult["errors"] = [];
  let sent = 0;
  let failed = 0;

  for (const [index, result] of results.entries()) {
    const chatId = targetManagers[index]!;

    if (result.status === "fulfilled") {
      sent++;
      console.warn(
        `✅ [${notificationType}] Notification delivered to ${chatId}`,
      );
    } else {
      failed++;
      const errorMessage =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);

      errors.push({ chatId, errorMessage });
      console.error(
        `❌ [${notificationType}] Failed to send to ${chatId}: ${errorMessage}`,
      );
    }
  }

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
  return sendToManagers(
    bot,
    message,
    NotificationTypes.ONLINE_PICKUP_RF,
    payload,
  );
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
  return sendToManagers(
    bot,
    message,
    NotificationTypes.PICK_UP_POINT_DELIVERY,
    payload,
  );
}
