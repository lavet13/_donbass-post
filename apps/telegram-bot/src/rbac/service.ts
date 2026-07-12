import { prisma } from "@/prisma";

// Fetch the FULL set of permission names this user has, across all their roles.
// Returns a Set for O(1) membership checks and easy caching later.
export async function getUserPermissions(userId: bigint): Promise<Set<string>> {
  const user = await prisma.telegramUser.findUnique({
    // TOP-LEVEL where = account-level gate: "is this account usable at all?"
    // A globally disabled account returns null = no access. One job.
    where: { chatId: userId, isActive: true },
    select: {
      userRoles: {
        // NESTED where = role-level gate: "which assignments count?"
        // Drops revoked rows. Does NOT affect whether the user is returned,
        // only which roles are included. Exactly the behavior we want.
        where: {
          // null = not revoked
          revokedAt: null,
        },
        select: {
          role: {
            select: {
              rolePermissions: {
                select: { permission: { select: { name: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return new Set();

  const names = user.userRoles.flatMap((ur) =>
    ur.role.rolePermissions.map((rp) => rp.permission.name),
  );

  return new Set(names);
}

export async function getUserRoles(userId: bigint): Promise<Set<string>> {
  const user = await prisma.telegramUser.findUnique({
    where: { chatId: userId, isActive: true },
    select: {
      userRoles: {
        where: {
          // null = not revoked
          revokedAt: null,
        },
        select: {
          role: { select: { name: true } },
        },
      },
    },
  });

  if (!user) return new Set([]);

  const names = user.userRoles.map((row) => row.role.name);

  return new Set(names);
}
