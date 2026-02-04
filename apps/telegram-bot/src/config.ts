import { getEnv } from "@/env";

/**
 * Application configuration loaded from environment variables
 */
export const config = {
  telegram: {
    token: getEnv("TELEGRAM_BOT_TOKEN"),
    useWebhook: getEnv("USE_WEBHOOK", "") === "true",
    webhookUrl: getEnv("WEBHOOK_URL", ""),
    webhookSecret: getEnv("WEBHOOK_SECRET", ""),
  },

  server: {
    port: parseInt(getEnv("PORT", "3000")),
    nodeEnv: getEnv("NODE_ENV") as "development" | "production",
  },

  managers: {
    /**
     * Get list of manager chat IDs
     * Expected format: "123456789,987654321,111222333"
     */
    getChatIds(): number[] {
      const chatIdsStr = getEnv("MANAGER_CHAT_IDS", "");

      if (!chatIdsStr) {
        console.warn(
          "⚠️ MANAGER_CHAT_IDS not set - notifications will not be sent",
        );
        return [];
      }

      return chatIdsStr
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0)
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
    },
  },
} as const;

export function validateConfig(cfg: typeof config): void {
  const errors: string[] = [];

  if (!cfg.telegram.token) {
    errors.push("TELEGRAM_BOT_TOKEN is required");
  }

  if (cfg.telegram.useWebhook) {
    if (!cfg.telegram.webhookUrl) {
      errors.push("WEBHOOK_URL is required when USE_WEBHOOK=true");
    }

    if (!cfg.telegram.webhookSecret) {
      console.warn(
        "⚠️ WEBHOOK_SECRET not set — webhook requests will NOT be verified!",
      );
    } else if (cfg.telegram.webhookSecret.length < 10) {
      errors.push("WEBHOOK_SECRET is too short (min 10 chars recommended)");
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join("\n")}`);
  }

  console.warn("✅ Configuration validated");
}
