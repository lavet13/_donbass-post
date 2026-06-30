import { prisma } from "@/prisma";
import { invalidateUser } from "@/rbac/cache";
import { Roles } from "@/rbac/types";

type AddManagerResult =
  | "fresh_manager"
  | "manager_role_not_found"
  | "reactivated_manager"
  | "already_manager";
/**
 * Add a manager to the database
 * if no assignment exists yet, create it fresh; if one exists but was revoked,
 * reactivate it by clearing the revocation timestamp; if it's already active,
 * return a no-op status
 */
export async function addManager({
  chatId,
  username,
  firstName,
  lastName,
}: {
  chatId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
}): Promise<AddManagerResult> {
  try {
    const telegramUser = await prisma.$transaction(
      async (
        tx,
      ): Promise<{
        id: string;
        chatId: bigint;
        statusToken: AddManagerResult;
      }> => {
        // const + ?? keeps it immutable: use the found user, or create one if absent.
        const found = await tx.telegramUser.findUnique({
          where: { chatId: BigInt(chatId) },
          select: { id: true, chatId: true },
        });

        const telegramUser =
          found ??
          (await tx.telegramUser.create({
            data: {
              chatId: BigInt(chatId),
              username,
              firstName,
              lastName,
              isActive: true,
            },
            select: { id: true, chatId: true },
          }));

        const managerRole = await tx.role.findUnique({
          where: {
            name: Roles.MANAGER,
          },
        });

        // Check if manager role exists
        if (!managerRole)
          return {
            statusToken: "manager_role_not_found",
            ...telegramUser,
          };

        // Check if the user has manager role(reactivated)
        const hasManagerRole = await tx.userRole.findUnique({
          where: {
            userId_roleId: {
              userId: telegramUser.id,
              roleId: managerRole.id,
            },
          },
        });

        if (!hasManagerRole) {
          // Add manager role for the user
          await tx.userRole.create({
            data: {
              userId: telegramUser.id,
              roleId: managerRole.id,
            },
          });

          return { statusToken: "fresh_manager", ...telegramUser };
        }

        // Role assignment exists but was revoked, reactivate it by clearing
        // timestamp.
        if (hasManagerRole.revokedAt !== null) {
          // Reclaiming manager role for the user
          await tx.userRole.update({
            where: {
              userId_roleId: {
                roleId: managerRole.id,
                userId: telegramUser.id,
              },
            },
            data: {
              revokedAt: null,
            },
          });

          return {
            statusToken: "reactivated_manager",
            ...telegramUser,
          };
        }

        // no-op
        return { statusToken: "already_manager", ...telegramUser };
      },
    );

    invalidateUser(telegramUser.chatId);

    return telegramUser.statusToken;
  } catch (err) {
    console.error("Failed to add manager:", err);
    throw err;
  }
}

type RemoveManagerResult =
  | "revoked"
  | "not_a_manager"
  | "user_not_found"
  | "user_deactivated";
/**
 * Revoke a user's manager role (soft-delete the UserRole assignment).
 * Sets revoked_at on the manager role only — leaves the account (is_active)
 * and any other roles untouched. Returns whether anything was actually revoked.
 */
export async function removeManager(
  chatId: number,
): Promise<RemoveManagerResult> {
  try {
    const user = await prisma.telegramUser.findUnique({
      where: { chatId: BigInt(chatId) },
    });

    if (!user) return "user_not_found";

    if (user.isActive === false) return "user_deactivated";

    const { count } = await prisma.userRole.updateMany({
      where: {
        userId: user.id,
        role: {
          name: Roles.MANAGER, // filter via the relation, no need to fetch role.id separately
        },
        revokedAt: null, // don't re-revoke an already-revoked row (keeps original timestamp)
      },
      data: {
        revokedAt: new Date(),
      },
    });

    invalidateUser(user.chatId);

    if (count > 0) {
      return "revoked";
    } else {
      return "not_a_manager";
    }
  } catch (err) {
    console.error("Failed to remove manager:", err);
    throw err;
  }
}

/**
 * Telegram users with an active manager-role assignment
 */
export async function getAllManagers(): Promise<number[]> {
  try {
    const assignments = await prisma.userRole.findMany({
      where: {
        revokedAt: null,
        role: { name: Roles.MANAGER },
        user: { isActive: true },
      },
      select: { user: { select: { chatId: true } } },
    });

    return assignments.map((a) => Number(a.user.chatId));
  } catch (err) {
    console.error("Failed to get all managers:", err);
    return [];
  }
}
