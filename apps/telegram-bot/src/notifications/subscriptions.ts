import type { NotificationType } from "@/notifications/notification-types";
import { prisma } from "@/prisma";
import { Roles } from "@/rbac/types";
import { assertNever } from "@/utils/assert-never";

/**
 * Get managers who should receive a specific notification type
 */
export async function getManagersForType(
  notificationType: NotificationType,
): Promise<number[]> {
  const managers = await prisma.userRole.findMany({
    where: {
      revokedAt: null,
      role: { name: Roles.MANAGER },
      user: {
        isActive: true,
        notificationPreferences: {
          some: {
            notificationType: {
              slug: notificationType,
            },
          },
        },
      },
    },
    select: { user: { select: { chatId: true } } },
  });

  return managers.map((m) => Number(m.user.chatId));
}

/**
 * Get all notification types a manager is subscribed to
 */
export async function getManagerSubscriptions(
  chatId: number,
): Promise<NotificationType[]> {
  try {
    const user = await prisma.telegramUser.findUnique({
      where: {
        chatId: BigInt(chatId),
        isActive: true,
        userRoles: { some: { revokedAt: null, role: { name: Roles.MANAGER } } },
      },
      select: {
        notificationPreferences: {
          select: { notificationType: { select: { slug: true } } },
        },
      },
    });

    if (!user) return [];
    return user.notificationPreferences.map(
      (np) => np.notificationType.slug as NotificationType,
    );
  } catch (err) {
    console.error("Failed to get manager notifications:", err);
    return [];
  }
}

/**
 * Get preferences for display (for /allpreferences command)
 */
export async function getAllManagerSubscriptions(): Promise<
  {
    chatId: number;
    notifications: NotificationType[];
  }[]
> {
  try {
    const assignments = await prisma.userRole.findMany({
      where: {
        revokedAt: null,
        role: { name: Roles.MANAGER },
        user: { isActive: true },
      },
      select: {
        user: {
          select: {
            chatId: true,
            notificationPreferences: {
              select: { notificationType: { select: { slug: true } } },
            },
          },
        },
      },
    });

    return assignments.map((a) => ({
      chatId: Number(a.user.chatId),
      notifications: a.user.notificationPreferences.map(
        (np) => np.notificationType.slug as NotificationType,
      ),
    }));
  } catch (err) {
    console.error("Failed to get all preferences:", err);
    return [];
  }
}

export function subscriptionErrorReply(
  result: SetManagerSubscriptionsResult,
): string | null {
  switch (result) {
    case "preferences_set":
      return null; // success — the caller sends its own confirmation
    case "user_not_found":
      return "❌ Пользователь не найден.";
    case "user_deactivated":
      return "❌ Аккаунт менеджера деактивирован.";
    case "user_role_not_found":
      return "❌ У пользователя нет роли менеджера.";
    case "user_role_revoked":
      return "❌ Роль менеджера была отозвана.";
    default:
      return assertNever(result); // // compile error if a token is left unhandled
  }
}

type SetManagerSubscriptionsResult =
  | "user_not_found"
  | "user_deactivated"
  | "user_role_not_found"
  | "user_role_revoked"
  | "preferences_set";
export async function setManagerSubscriptions(
  chatId: number,
  notificationTypes: NotificationType[],
): Promise<SetManagerSubscriptionsResult> {
  try {
    const user = await prisma.telegramUser.findUnique({
      where: {
        chatId: BigInt(chatId),
      },
    });

    if (!user) {
      return "user_not_found";
    }

    if (user.isActive === false) return "user_deactivated";

    // Check if the user has manager role
    const hasManagerRole = await prisma.userRole.findFirst({
      where: {
        userId: user.id,
        role: { name: Roles.MANAGER },
      },
    });

    if (!hasManagerRole) return "user_role_not_found";

    // null = active
    // revokedAt is a timestamp (not null) → the role WAS revoked → reject.
    if (hasManagerRole.revokedAt !== null) return "user_role_revoked";

    // Get notification type IDs
    const notificationTypeRecords = await prisma.notificationType.findMany({
      where: {
        slug: { in: notificationTypes },
      },
    });

    await prisma.$transaction(async (tx) => {
      // Delete existing preferences
      await tx.notificationPreferences.deleteMany({
        where: { userId: user.id },
      });

      // Create new preferences
      await tx.notificationPreferences.createMany({
        data: notificationTypeRecords.map((nt) => ({
          userId: user.id,
          notificationTypeId: nt.id,
        })),
      });
    });

    console.log(`Preferences updated for manager: ${chatId}`);
    return "preferences_set";
  } catch (err) {
    console.error("Failed to set manager preferences:", err);
    throw err;
  }
}
