import { prisma } from "@/prisma";
import { invalidateUser } from "@/rbac/cache";
import { Roles } from "@/rbac/types";

type AddManagerResult =
  | "fresh_manager"
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

        // Check if the user has manager role(reactivated)
        const hasManagerRole = await tx.userRole.findFirst({
          where: {
            userId: telegramUser.id,
            role: { name: Roles.MANAGER },
          },
          select: {
            roleId: true,
            userId: true,
            revokedAt: true,
          },
        });

        if (!hasManagerRole) {
          // Add manager role for the user
          await tx.userRole.create({
            data: {
              user: { connect: { id: telegramUser.id } },
              role: { connect: { name: Roles.MANAGER } },
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
                roleId: hasManagerRole.roleId,
                userId: hasManagerRole.userId,
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
 *
 *  PERF: If the manager list ever grows, the honest version is a single targeted query
 *  telegramUser.findFirst({
 *    where: {
 *       chatId, isActive: true,
 *       userRoles: { some: { revokedAt: null, role: { name: MANAGER } } }
 *     },
 *     select: { id: true }
 *  }) — returning { userId } | null.
 *
 *   Not now (YAGNI, and getAllManagers is reused elsewhere), but it's the same smell,
 *   so I'm naming it. getAllManagers now does more work per call, and it's on hot paths.
 *   It was already findMany over all manager assignments; adding id to the select is free.
 *   But note resolveManagerCommand calls getAllManagers() (full table scan of active managers)
 *   on every admin command just to resolve one chatId.
 */
export async function getAllManagers(): Promise<
  { chatId: number; userId: string }[]
> {
  try {
    const assignments = await prisma.userRole.findMany({
      where: {
        revokedAt: null,
        role: { name: Roles.MANAGER },
        user: { isActive: true },
      },
      select: { user: { select: { chatId: true, id: true } } },
    });

    return assignments.map((row) => ({
      chatId: Number(row.user.chatId),
      userId: row.user.id,
    }));
  } catch (err) {
    console.error("Failed to get all managers:", err);
    return [];
  }
}
