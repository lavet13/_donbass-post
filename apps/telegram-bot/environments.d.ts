declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      TELEGRAM_BOT_TOKEN?: string;
      USE_WEBHOOK?: "true";
      WEBHOOK_URL?: string;
      WEBHOOK_SECRET?: string;
      PORT?: string;

      MANAGER_CHAT_IDS?: string;
    }
  }
}

export {};
