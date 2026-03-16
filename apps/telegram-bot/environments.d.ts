export type EnvKeys =
  | "NODE_ENV"
  | "TELEGRAM_BOT_TOKEN"
  | "USE_WEBHOOK"
  | "WEBHOOK_URL"
  | "WEBHOOK_SECRET"
  | "PORT"
  | "MANAGER_CHAT_IDS"
  | "DATABASE_URL";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Record<EnvKeys, string | undefined> {
      NODE_ENV: "development" | "production";
      TELEGRAM_BOT_TOKEN?: string;
      USE_WEBHOOK?: "true";
      WEBHOOK_URL?: string;
      WEBHOOK_SECRET?: string;
      PORT?: string;

      MANAGER_CHAT_IDS?: string;

      DATABASE_URL?: string;
    }
  }
}

export {};
