// This is what the rest of the app imports - never process.env directly.
export type TelegramConfig =
  | {
      useWebhook: true;
      token: string;
      webhookUrl: string;
      webhookSecret?: string;
      rootAdminChatId?: number;
    }
  | {
      useWebhook: false;
      token: string;
      rootAdminChatId?: number;
    };

export type AppConfig = {
  telegram: TelegramConfig;
  server: {
    port: number;
    nodeEnv: "development" | "production";
  };
};
