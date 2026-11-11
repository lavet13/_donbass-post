// This is what the rest of the app imports - never process.env directly.
export type TelegramConfig =
  | {
      useWebhook: true;
      token: string;
      webhookUrl: string;
      webhookSecret?: string;
      rootAdminChatId?: number;
      proxy?: string;
    }
  | {
      useWebhook: false;
      token: string;
      rootAdminChatId?: number;
      proxy?: string;
    };

export type AppConfig = {
  telegram: TelegramConfig;
  server: {
    port: number;
    nodeEnv: "development" | "production";
  };
  trackGlobal: {
    key: string | undefined;
    bearer: string | undefined;
    host: string;
  },
};
