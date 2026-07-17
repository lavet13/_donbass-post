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
  | "last_manager";
/**
 * Revoke a user's manager role (soft-delete the UserRole assignment).
 * Sets revoked_at on the manager role only — leaves the account (is_active)
 * and any other roles untouched. Returns whether anything was actually revoked.
 */
export async function removeManager(
  chatId: number,
): Promise<RemoveManagerResult> {
  try {
    const result = await prisma.$transaction(
      async (tx): Promise<RemoveManagerResult> => {
        const user = await tx.telegramUser.findUnique({
          where: { chatId: BigInt(chatId) },
          select: { id: true },
        });

        if (!user) return "user_not_found";

        // Is the target actually an active manager? (Also gives us roleId for the update.)
        const assignment = await tx.userRole.findFirst({
          where: {
            userId: user.id,
            revokedAt: null,
            user: { isActive: true },
            role: { name: Roles.MANAGER },
          },
          select: { roleId: true },
        });

        if (!assignment) return "not_a_manager";

        // THE INVARIANT: count active managers OTHER than the target.
        // Inside the transaction, so the count can't go stale before the write.
        const others = await tx.userRole.count({
          where: {
            revokedAt: null, // null = active
            role: { name: Roles.MANAGER },
            user: { isActive: true, id: { not: user.id } },
          },
        });
        if (others === 0) return "last_manager"; // removing this one would leave zero

        await tx.userRole.update({
          where: {
            userId_roleId: { userId: user.id, roleId: assignment.roleId },
          },
          data: { revokedAt: new Date() },
        });
        return "revoked";
      },
    );

    if (result === "revoked") invalidateUser(BigInt(chatId)); // cache, not DB lookup

    return result;
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
