declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      TELEGRAM_BOT_TOKEN?: string;
      PORT?: string;
      WEBHOOK_URL?: string;
    }
  }
}

export {};
