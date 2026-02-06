import { Bot } from "grammy";
import { config } from "@/config";
import {
  formatOnlinePickupMessage,
  formatGenericMessage,
  formatPickUpPointDeliveryOrderMessage,
} from "@/formatters/messages";
import type { OnlinePickupPayload, PickUpPointDeliveryOrderPayload } from "@/types/notifications";

/**
 * Result of sending notifications to managers
 */
export interface NotificationResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: Array<{ chatId: number; error: string }>;
}

/**
 * Send a message to all configured managers
 *
 * This is the core function - it just sends a formatted message to all managers.
 * The message formatting is handled by separate formatter functions.
 *
 * @param bot - Telegram bot instance
 * @param message - Formatted HTML message to send
 * @returns Statistics about the send operation
 */
export async function sendToManagers(
  bot: Bot,
  message: string,
): Promise<NotificationResult> {
  const managerChatIds = config.managers.getChatIds();

  if (managerChatIds.length === 0) {
    console.warn("⚠️ No manager chat IDs configured");
    return { success: false, sent: 0, failed: 0, errors: [] };
  }

  const results = await Promise.allSettled(
    managerChatIds.map((chatId) =>
      bot.api.sendMessage(chatId, message, { parse_mode: "HTML" }),
    ),
  );

  const errors: Array<{ chatId: number; error: string }> = [];
  let sent = 0;
  let failed = 0;

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      sent++;
      console.warn(`✅ Notification sent to manager ${managerChatIds[index]}`);
    } else {
      failed++;
      const error =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);

      errors.push({ chatId: managerChatIds[index]!, error });
      console.error(
        `❌ Failed to send to manager ${managerChatIds[index]}: ${error}`,
      );
    }
  });

  return {
    success: sent > 0,
    sent,
    failed,
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
  return sendToManagers(bot, message);
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
  return sendToManagers(bot, message);
}

/**
 * Send generic notification to all managers
 *
 * Convenience function that formats and sends in one step.
 */
export async function notifyGeneric(
  bot: Bot,
  formType: string,
  data: Record<string, any>,
) {
  const message = formatGenericMessage(formType, data);
  return sendToManagers(bot, message);
}
