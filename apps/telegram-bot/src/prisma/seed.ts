import { env } from "@/env";
import type { Prisma } from "@/lib/prisma/client";
import { prisma } from "@/prisma";
import type { NotificationType } from "@/notifications/notification-types";
import {
  Permissions,
  Roles,
  WILDCARD,
  type Permission,
  type Role,
  type Wildcard,
} from "@/rbac/types";

const ROLE_DEFINITIONS = [
  {
    name: Roles.ROOT,
    description: "Root(the creator)",
    permissions: [WILDCARD],
  },
  {
    name: Roles.ADMIN,
    description: "Admin(has been given the role of an admin by root)",
    permissions: [Permissions.USERS_MANAGE, Permissions.BOT_VIEW_STATUS],
  },
  {
    name: Roles.MANAGER,
    description: "Manager(has been given the role of an admin by root)",
    permissions: [Permissions.BOT_VIEW_STATUS],
  },
] as const satisfies readonly {
  name: Role;
  description: string;
  permissions: readonly (Permission | Wildcard)[];
}[];

export const effectivePermissions = new Set(
  ROLE_DEFINITIONS.flatMap((rf) => rf.permissions).filter(
    (p): p is Permission => p !== WILDCARD,
  ),
);

const notificationTypes = [
  {
    slug: "online-pickup-rf",
    name: "Онлайн-забор по РФ",
    description:
      "Уведомления о новых заявках на онлайн-забор посылок по территории РФ",
  },
  {
    slug: "pick-up-point-delivery-order",
    name: "Забор груза ЛДНР/Запорожье",
    description:
      "Уведомления о новых заявках на забор груза в ЛДНР и Запорожской области",
  },
  {
    slug: "ali-parcel-pickup",
    name: "Забор посылки AliExpress",
    description: "Уведомления о новых заявках на забор посылок AliExpress",
  },
] satisfies {
  slug: NotificationType;
  name: string;
  description: string;
}[];

async function main() {
  console.log("Starting database seeding...");

  // 1. Create notification types
  console.log("Creating notification types...");

  for (const type of notificationTypes) {
    await prisma.notificationType.upsert({
      where: { slug: type.slug },
      update: type,
      create: type,
    });
    console.log(`✅ Created/Updated notification type: ${type.name}`);
  }

  // This RoleGetPayload would be satisfied if you provide id, other than that
  // it skips just to be aware of.
  const rolesCreated = new Map<
    (typeof ROLE_DEFINITIONS)[number]["name"],
    Prisma.RoleGetPayload<{
      select: {
        id: true;
      };
    }>
  >([]);

  // 2. Create role and permissions
  for (const { name, description, permissions } of ROLE_DEFINITIONS) {
    const roleRecord = await prisma.role.upsert({
      create: { name, description },
      update: {},
      where: { name },
      select: { id: true },
    });

    rolesCreated.set(name, roleRecord);

    const resolved: Permission[] = permissions.some((p) => p === WILDCARD)
      ? [...effectivePermissions]
      : (permissions as readonly Permission[]).slice();

    for (const perm of resolved) {
      const permRecord = await prisma.permission.upsert({
        create: { name: perm },
        update: {},
        where: { name: perm },
      });

      // 3. Linking role with their permissions
      await prisma.rolePermission.upsert({
        create: { roleId: roleRecord.id, permissionId: permRecord.id },
        update: {},
        where: {
          roleId_permissionId: {
            roleId: roleRecord.id,
            permissionId: permRecord.id,
          },
        },
      });
    }
  }

  // 4. Migrate existing managers from MANAGER_CHAT_IDS
  console.log("\nMigrating managers from environment variables...");

  const managerChatIds = env.MANAGER_CHAT_IDS;

  if (managerChatIds.length === 0) {
    console.warn("⚠ No MANAGER_CHAT_IDS found in environment");
  }

  const activeManagerCount = await prisma.userRole.count({
    where: {
      revokedAt: null, // not revoked
      role: { name: Roles.MANAGER }, // is the manager role
      user: { isActive: true }, // on an enabled account
    },
  });

  // Bootstrap-only when there's no managers in the database
  if (activeManagerCount > 0) {
    console.warn("Managers already exist — skipping env bootstrap");
  } else {
    for (const chatId of managerChatIds) {
      const telegramUser = await prisma.telegramUser.upsert({
        where: { chatId: BigInt(chatId), isActive: true },
        update: { isActive: true },
        create: { chatId: BigInt(chatId), isActive: true },
        select: { id: true },
      });

      const managerRecord = rolesCreated.get("manager")!;

      await prisma.userRole.upsert({
        create: { roleId: managerRecord.id, userId: telegramUser.id },
        update: { revokedAt: null },
        where: {
          userId_roleId: { roleId: managerRecord.id, userId: telegramUser.id },
        },
      });

      // 5. Create Manager profile if doesn't exist
      await prisma.manager.upsert({
        where: { telegramUserId: telegramUser.id },
        update: {},
        create: { telegramUserId: telegramUser.id },
        select: { id: true },
      });

      console.log(`✅ Created/Updated manager: ${chatId}`);
    }
  }

  // Gate: only backfill when the NEW table is empty. Once it has any rows
  // (from this backfill OR from migrated runtime writes), never run again —
  // so a runtime-removed subscription can't be resurrected from the frozen old table.
  const existingPrefsCount = await prisma.notificationPreferences.count();

  if (existingPrefsCount > 0) {
    console.warn(
      "NotificationPreferences already populated — skipping backfill",
    );
  } else {
    // read OLD rows, carrying the bridge field manager.telegramUserId
    const oldPrefs = await prisma.managerNotificationPreferences.findMany({
      select: {
        notificationTypeId: true,
        manager: { select: { telegramUserId: true } }, // the bridge to userId
      },
    });

    await prisma.notificationPreferences.createMany({
      data: oldPrefs.map((p) => ({
        userId: p.manager.telegramUserId,
        notificationTypeId: p.notificationTypeId,
      })),
    });
  }

  const rootChatId = env.ROOT_ADMIN_CHAT_ID;

  if (rootChatId === undefined) {
    console.warn("⚠ ROOT_ADMIN_CHAT_ID not set — skipping root bootstrap");
  } else {
    const rootUser = await prisma.telegramUser.upsert({
      where: { chatId: BigInt(rootChatId) },
      update: { isActive: true },
      create: { chatId: BigInt(rootChatId), isActive: true },
      select: { id: true },
    });

    const rootRole = rolesCreated.get("root")!; // safe: we just seeded it above
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: rootUser.id, roleId: rootRole.id } },
      update: { revokedAt: null },
      create: { userId: rootUser.id, roleId: rootRole.id },
      select: { userId: true },
    });

    console.log(`✅ Root admin bootstrapped: ${rootChatId}`);
  }

  console.log("\n✅ Database seeding completed!");
}

main()
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
