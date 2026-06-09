import { prisma } from "@/prisma";

// Fetch the FULL set of permission names this user has, across all their roles.
// Returns a Set for O(1) membership checks and easy caching later.
export async function getUserPermissions(userId: bigint): Promise<Set<string>> {
  const user = await prisma.telegramUser.findUnique({
    where: { chatId: userId, isActive: true },
    select: {
      userRoles: {
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

  if (!user) return new Set([]);

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
        select: {
          role: { select: { name: true } },
        },
      },
    },
  });

  if (!user) return new Set([]);

  const names = user.userRoles.map((ur) => ur.role.name);

  return new Set(names);
}
