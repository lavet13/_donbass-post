import { env, type RawEnv } from "@/env";
import { prisma } from "@/prisma";
import { NotificationTypes } from "@/types/notification-types";
import type { AppConfig } from "@/types/config";

function buildConfig(env: RawEnv): AppConfig {
  let telegram: AppConfig["telegram"];

  if (env.USE_WEBHOOK === "true") {
    if (!env.WEBHOOK_SECRET) {
      console.warn(
        "⚠ WEBHOOK_SECRET not set — webhook requests will NOT be verified!",
      );
    }

    telegram = {
      useWebhook: true,
      token: env.TELEGRAM_BOT_TOKEN,
      rootAdminChatId: env.ROOT_ADMIN_CHAT_ID,
      webhookUrl: env.WEBHOOK_URL,
      webhookSecret: env.WEBHOOK_SECRET,
    };
  } else {
    telegram = {
      useWebhook: false,
      token: env.TELEGRAM_BOT_TOKEN,
      rootAdminChatId: env.ROOT_ADMIN_CHAT_ID,
    };
  }

  return {
    telegram,
    server: {
      port: env.PORT, // already a number from transform
      nodeEnv: env.NODE_ENV,
    },
    managers: {
      chatIds: env.MANAGER_CHAT_IDS, // already number[] from transform
    },
  };
}

export const config = buildConfig(env);

export async function validateNotificationTypes() {
  const dbTypes = await prisma.notificationType.findMany({
    select: { slug: true },
  });
  const dbSlugs = new Set(dbTypes.map((t) => t.slug));

  const missingSlugs = Object.values(NotificationTypes).filter(
    (slug) => !dbSlugs.has(slug),
  );

  if (missingSlugs.length > 0) {
    throw new Error(
      `Notification types missing from DB: ${missingSlugs.join(", ")}. Run yarn db:seed.`,
    );
  } else {
    console.warn("✅ Notification types validated against DB");
  }
}
