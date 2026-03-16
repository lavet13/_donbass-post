import { getEnv } from "@/env";
import { prisma } from "@/prisma";
import type { NotificationType } from "@/types/notification-types";

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
