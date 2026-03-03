import type { Prisma } from "@/lib/prisma/client";
import { prisma } from "@/prisma";
import type { NotificationType } from "@/types/notification-types";

export interface ManagerPreferences {
  chatId: number;
  notifications: NotificationType[];
}

/**
 * Database-backed Manager Notification Preferences Service
 *
 * Works with the TelegramUser -> Manager -> Preferences structure
 */
export class ManagerPreferencesService {
  /**
   * Get managers who should receive a specific notification type
   */
  async getManagersForNotification(
    notificationType: NotificationType,
  ): Promise<number[]> {
    try {
      const notificationTypeRecord = await prisma.notificationType.findUnique({
        where: { slug: notificationType },
      });

      if (!notificationTypeRecord) {
        console.warn(
          `Notification type not found in database: ${notificationType}`,
        );
        return [];
      }

      const preferences = await prisma.managerNotificationPreferences.findMany({
        where: {
          notificationTypeId: notificationTypeRecord.id,
          manager: { telegramUser: { isActive: true } },
        },
        include: {
          manager: {
            include: {
              telegramUser: true,
            },
          },
        },
      });

      return preferences.map((pref) =>
        Number(pref.manager.telegramUser.chatId),
      );
    } catch (err) {
      console.error("Failed to get managers for notification:", err);
      return [];
    }
  }

  /**
   * Get all notification types a manager is subscribed to
   */
  async getManagerNotifications(chatId: number): Promise<NotificationType[]> {
    try {
      const telegramUser = await prisma.telegramUser.findUnique({
        where: {
          chatId: BigInt(chatId),
        },
        include: {
          managerProfile: {
            include: {
              preferences: {
                include: {
                  notificationType: {
                    select: {
                      slug: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (
        !telegramUser ||
        !telegramUser.isActive ||
        !telegramUser.managerProfile
      ) {
        return [];
      }

      return telegramUser.managerProfile.preferences.map(
        (pref) => pref.notificationType.slug as NotificationType,
      );
    } catch (err) {
      console.error("Failed to get manager notifications:", err);
      return [];
    }
  }

  /**
   * Get all managers
   */
  async getAllManagers(): Promise<number[]> {
    try {
      const managers = await prisma.manager.findMany({
        where: {
          telegramUser: {
            isActive: true,
          },
        },
        include: {
          telegramUser: true,
        },
      });

      return managers.map((m) => Number(m.telegramUser.chatId));
    } catch (err) {
      console.error("Failed to get all managers:", err);
      return [];
    }
  }

  /**
   * Get preferences for display (for /allpreferences command)
   */
  async getAllPreferences(): Promise<ManagerPreferences[]> {
    try {
      const managers = await prisma.manager.findMany({
        where: {
          telegramUser: {
            isActive: true,
          },
        },
        include: {
          telegramUser: true,
          preferences: {
            include: {
              notificationType: true,
            },
          },
        },
      });

      return managers.map((manager) => ({
        chatId: Number(manager.telegramUser.chatId),
        notifications: manager.preferences.map(
          (pref) => pref.notificationType.slug as NotificationType,
        ),
      }));
    } catch (err) {
      console.error("Failed to get all preferences:", err);
      return [];
    }
  }

  /*
   * Check if a manager is subscribed to a notification type
   * */
  async isManagerSubscribed(
    chatId: number,
    notificationType: NotificationType,
  ): Promise<boolean> {
    try {
      const telegramUser = await prisma.telegramUser.findUnique({
        where: { chatId: BigInt(chatId) },
        include: {
          managerProfile: {
            include: {
              preferences: {
                include: {
                  notificationType: true,
                },
              },
            },
          },
        },
      });

      if (
        !telegramUser ||
        !telegramUser.isActive ||
        !telegramUser.managerProfile
      ) {
        return false;
      }

      return telegramUser.managerProfile.preferences.some(
        (pref) => pref.notificationType.slug === notificationType,
      );
    } catch (err) {
      console.error("Failed to check manager subscription:", err);
      return false;
    }
  }

  /**
   * Add a manager to the database
   */
  async addManager({
    chatId,
    username,
    firstName,
    lastName,
  }: {
    chatId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Create or update TelegramUser
        const telegramUser = await tx.telegramUser.upsert({
          where: { chatId: BigInt(chatId) },
          update: {
            username,
            firstName,
            lastName,
            isActive: true,
          },
          create: {
            chatId: BigInt(chatId),
            username,
            firstName,
            lastName,
            isActive: true,
          },
        });

        await tx.manager.upsert({
          where: { telegramUserId: telegramUser.id },
          update: {},
          create: {
            telegramUserId: telegramUser.id,
          },
        });
      });

      console.log(`✅ Manager added/updated: ${chatId}`);
    } catch (err) {
      console.error("Failed to add manager:", err);
      throw err;
    }
  }

  /**
   * Remove a manager (set user inactive)
   */
  async removeManager(chatId: number): Promise<void> {
    try {
      await prisma.telegramUser.update({
        where: { chatId: BigInt(chatId) },
        data: { isActive: false },
      });
    } catch (err) {
      console.error("Failed to remove manager:", err);
      throw err;
    }
  }

  async setManagerPreferences(
    chatId: number,
    notificationTypes: NotificationType[],
  ): Promise<void> {
    try {
      const telegramUser = await prisma.telegramUser.findUnique({
        where: {
          chatId: BigInt(chatId),
        },
        include: {
          managerProfile: true,
        },
      });

      if (!telegramUser || !telegramUser.managerProfile) {
        throw new Error(`Manager not found: ${chatId}`);
      }

      const manager = telegramUser.managerProfile;

      // Get notification type IDs
      const notificationTypeRecords = await prisma.notificationType.findMany({
        where: {
          slug: { in: notificationTypes },
        },
      });

      await prisma.$transaction(async (tx) => {
        // Delete existing preferences
        await tx.managerNotificationPreferences.deleteMany({
          where: { managerId: manager.id },
        });

        // Create new preferences
        await tx.managerNotificationPreferences.createMany({
          data: notificationTypeRecords.map((nt) => ({
            managerId: manager.id,
            notificationTypeId: nt.id,
          })),
        });
      });

      console.log(`Preferences updated for  manager: ${chatId}`);
    } catch (err) {
      console.error("Failed to set manager preferences:", err);
      throw err;
    }
  }

  async getAllAvailableNotificationTypes(): Promise<
    Array<Prisma.NotificationTypeGetPayload<{}>>
  > {
    try {
      const types = await prisma.notificationType.findMany({
        where: { isActive: true },
      });

      return types;
    } catch (err) {
      console.error("Failed to get notification types:", err);
      return [];
    }
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
