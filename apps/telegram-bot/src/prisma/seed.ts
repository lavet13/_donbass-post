import { getEnv } from "@/env";
import { prisma } from "@/prisma";

async function main() {
  console.log("Starting database seeding...");

  // 1. Create notification types
  console.log("Creating notification types...");

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
  ];

  for (const type of notificationTypes) {
    await prisma.notificationType.upsert({
      where: {
        slug: type.slug,
      },
      update: type,
      create: type,
    });
    console.log(`✅ Created/Updated notification type: ${type.name}`);
  }

  // 2. Migrate existing managers from MANAGER_CHAT_IDS
  console.log("\nMigrating managers from environment variables...");

  const managerChatIdsStr = getEnv("MANAGER_CHAT_IDS", "");
  const managerChatIds = managerChatIdsStr
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0)
    .map((id) => parseInt(id, 10))
    .filter((id) => !isNaN(id));

  if (managerChatIds.length === 0) {
    console.warn("⚠ No MANAGER_CHAT_IDS found in environment");
  }

  for (const chatId of managerChatIds) {
    const telegramUser = await prisma.telegramUser.upsert({
      where: {
        chatId: BigInt(chatId),
      },
      update: {
        isActive: true,
      },
      create: {
        chatId: BigInt(chatId),
        isActive: true,
      },
    });

    // Create Manager profile if doesn't exist
    await prisma.manager.upsert({
      where: {
        telegramUserId: telegramUser.id,
      },
      update: {},
      create: {
        telegramUserId: telegramUser.id,
      },
    });

    console.log(`✅ Created/Updated manager: ${chatId}`);
  }

  // 3. Migrate notification preferences from MANAGER_NOTIFICATION_PREFERENCES
  console.log("\nMigrating notification preferences...");

  const preferencesStr = getEnv("MANAGER_NOTIFICATION_PREFERENCES", "");

  if (!preferencesStr) {
    console.log("⚠ No MANAGER_NOTIFICATION_PREFERENCES found");
    console.log("ℹ All managers will need preferences set via bot commands");
  } else {
    try {
      const preferences = JSON.parse(preferencesStr) as Record<
        string,
        string[]
      >;

      for (const [chatIdStr, notificationSlugs] of Object.entries(
        preferences,
      )) {
        const chatId = parseInt(chatIdStr, 10);

        if (isNaN(chatId)) {
          console.log(`⚠ Invalid chat ID: ${chatId}`);
          continue;
        }

        const telegramUser = await prisma.telegramUser.findUnique({
          where: { chatId: BigInt(chatId) },
          include: { managerProfile: true },
        });

        if (!telegramUser || !telegramUser.managerProfile) {
          console.warn(`⚠ Manager not found for chat ID: ${chatId}`);
          continue;
        }

        const manager = telegramUser.managerProfile;

        // Clear existing preferences
        await prisma.managerNotificationPreferences.deleteMany({
          where: {
            managerId: manager.id,
          },
        });

        for (const slug of notificationSlugs) {
          const notificationType = await prisma.notificationType.findUnique({
            where: { slug },
          });

          if (!notificationType) {
            console.warn(`⚠ Unknown notification type: ${slug}`);
            continue;
          }

          await prisma.managerNotificationPreferences.create({
            data: {
              managerId: manager.id,
              notificationTypeId: notificationType.id,
            },
          });

          console.log(
            `✅ Set preference for manager ${manager.id}: ${notificationType.id}`,
          );
        }
      }
    } catch (err) {
      console.error(
        `❌ Failed to parse MANAGER_NOTIFICATION_PREFERENCES:`,
        err,
      );
    }
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
