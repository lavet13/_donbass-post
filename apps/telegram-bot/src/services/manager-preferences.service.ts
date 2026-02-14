import { getEnv } from "@/env";
import type { NotificationType } from "@/types/notification-types";

export interface ManagerPreferences {
  chatId: number;
  notifications: NotificationType[];
}

/**
 * Manager notification preferences service
 *
 * This service handles routing notifications to managers based on their preferences.
 * Without a database, preferences are stored in environment variables.
 *
 * BEHAVIOR:
 * - If MANAGER_NOTIFICATION_PREFERENCES is NOT set → all managers get all notifications (backward compatible)
 * - If MANAGER_NOTIFICATION_PREFERENCES is set → explicit opt-in mode:
 *   * Managers IN the config get ONLY their specified notifications
 *   * Managers NOT in the config get NOTHING (opted out)
 *   * Empty array [] = explicitly disable all notifications for that manager
 */
export class ManagerPreferencesService {
  private preferences: Map<number, Set<NotificationType>> = new Map();
  private allManagerChatIds: number[] = [];

  constructor() {
    this.loadPreferences();
  }

  /**
   * Load manager preferences from environment
   */
  private loadPreferences(): void {
    // Load all manager chat IDs
    const chatIdsStr = getEnv("MANAGER_CHAT_IDS", "");

    if (chatIdsStr) {
      this.allManagerChatIds = chatIdsStr
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0)
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
    }

    // Load notification preferences
    const preferencesStr = getEnv("MANAGER_NOTIFICATION_PREFERENCES", "");

    if (!preferencesStr) {
      console.warn(
        "⚠️ MANAGER_NOTIFICATION_PREFERENCES not set - all managers will receive all notifications",
      );
      return;
    }

    try {
      const preferencesObj = JSON.parse(preferencesStr.trim()) as Record<
        string,
        string[]
      >;

      for (const [chatIdStr, notificationTypes] of Object.entries(
        preferencesObj,
      )) {
        const chatId = parseInt(chatIdStr, 10);

        if (isNaN(chatId)) {
          console.warn(`⚠️ Invalid chat ID in preferences: ${chatIdStr}`);
          continue;
        }

        // Verify this chat ID is in the manager list
        if (!this.allManagerChatIds.includes(chatId)) {
          console.warn(
            `⚠️ Chat ID ${chatId} has preferences but is not in MANAGER_CHAT_IDS`,
          );
          continue;
        }

        this.preferences.set(
          chatId,
          new Set(notificationTypes as NotificationType[]),
        );
      }

      console.warn(
        `✅ Loaded notification preferences for ${this.preferences.size} managers`,
      );
    } catch (error) {
      console.error(`Failed to parse MANAGER_NOTIFICATION_PREFERENCES:`, error);
      console.error(
        'Expected format: {"123456789":["online-pickup-rf"],"987654321":["pick-up-point-delivery"]}',
      );
    }
  }

  /**
   * Get managers who should receive a specific notification type
   */
  getManagersForNotification(notificationType: NotificationType): number[] {
    // If no preferences configured, send to all managers (backward compatibility)
    if (this.preferences.size === 0) {
      return this.allManagerChatIds;
    }

    const managers: number[] = [];

    for (const chatId of this.allManagerChatIds) {
      const managerPreferences = this.preferences.get(chatId);

      // If manager is NOT in preferences config, skip them (explicit opt-in required)
      if (!managerPreferences) {
        continue;
      }
      // If manager has empty preferences array, they get nothing
      if (managerPreferences.size === 0) {
        continue;
      }

      // If manager has this notification type in preferences, include them
      if (managerPreferences.has(notificationType)) {
        managers.push(chatId);
      }
    }

    return managers;
  }

  /**
   * Get all notification types a manager is subscribed to
   *
   * Returns empty array if:
   * - Manager has no preferences (opted out / not configured)
   * - Manager has empty array in preferences (explicitly disabled all)
   */
  getManagerNotifications(chatId: number): NotificationType[] {
    const prefs = this.preferences.get(chatId);

    if (!prefs) {
      // No preferences for this manager - they're opted out
      return [];
    }

    return [...prefs];
  }

  /**
   * Get all managers
   */
  getAllManagers(): number[] {
    return this.allManagerChatIds;
  }

  /**
   * Get preferences for display
   */
  getAllPreferences(): ManagerPreferences[] {
    if (this.preferences.size === 0) {
      return [];
    }

    return [...this.preferences].map(([chatId, notifications]) => ({
      chatId,
      notifications: [...notifications],
    }));
  }

  /*
   * Check if a manager is subscribed to a notification type
   * */
  isManagerSubscribed(
    chatId: number,
    notificationType: NotificationType,
  ): boolean {
    // If no preferences configured, everyone gets everything
    if (this.preferences.size === 0) {
      return true;
    }

    const prefs = this.preferences.get(chatId);

    // No preferences for this manager means they explicitly opted out (get nothing)
    if (!prefs) {
      return false;
    }

    // Empty array means they opted in but disabled all notifications
    if (prefs.size === 0) {
      return false;
    }

    return prefs.has(notificationType);
  }
}

// Singleton instance
let instance: ManagerPreferencesService | null = null;

export function getManagerPreferences(): ManagerPreferencesService {
  if (!instance) {
    instance = new ManagerPreferencesService();
  }
  return instance;
}
