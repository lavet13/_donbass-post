import { Bot, Context, GrammyError, HttpError } from "grammy";
import { formatRussianDateTime } from "@/utils";
import { autoRetry } from "@grammyjs/auto-retry";
import { registerCommands } from "@/commands";
import { config } from "@/config";
import type { Update } from "grammy/types";

export type TCustomBot = Bot<Context> & {};

export class BotManager {
  private static instance: BotManager | null = null;
  private bot: TCustomBot | null = null;
  private mode: "webhook" | "polling" | null = null;

  private constructor() {}

  static getInstance(): BotManager {
    if (!BotManager.instance) {
      BotManager.instance = new BotManager();
    }
    return BotManager.instance;
  }

  getBot(): TCustomBot {
    if (!this.bot) {
      // This is a programmer error, not a runtime condition
      throw new Error(
        "BotManager.getBot() called before BotManager.initialize()",
      );
    }
    return this.bot;
  }

  isRunning(): boolean {
    return this.bot !== null && this.mode !== null;
  }

  getMode(): "webhook" | "polling" | null {
    return this.mode;
  }

  async initialize(token: string): Promise<void> {
    if (this.bot) {
      console.warn("Bot already initialized, skipping...");
      return;
    }

    try {
      this.bot = new Bot(token);

      this.bot.api.config.use(
        autoRetry({
          maxRetryAttempts: 5,
          maxDelaySeconds: 300,
        }),
      );

      // CRITICAL: Initialize bot info for webhook mode
      // This fetches bot information from Telegram
      await this.bot.init();

      this.setupErrorHandling(this.bot);
      this.setupHandlers(this.bot);

      console.warn("Bot initialized successfully");
    } catch (error) {
      console.error("Failed to initialize bot:", error);
      throw error;
    }
  }

  private setupErrorHandling(bot: Bot): void {
    bot.catch((err) => {
      const ctx = err.ctx;
      const updateId = ctx?.update?.update_id ?? "—";
      console.error(`Error in update ${updateId}:`, err);

      const e = err.error;

      let prefix = "";
      if (ctx?.from) {
        prefix = `from user ${ctx.from.id} (${ctx.from.username || "no username"}) `;
      }
      if (ctx?.chat) {
        prefix += `in chat ${ctx.chat.id} (${ctx.chat.type}) `;
      }

      if (e instanceof GrammyError) {
        const desc = e.description;
        const params = e.parameters ? JSON.stringify(e.parameters) : "";

        switch (e.error_code) {
          // Bot was blocked / kicked / chat not found
          case 403: {
            console.warn(`Bot blocked/kicked/chat not found ${prefix}`);
            break;
          }

          // Flood wait
          case 429: {
            const retryAfter = e.parameters.retry_after ?? "uknown";
            console.warn(
              `Rate limited ${prefix}, retry after ${retryAfter} sec`,
            );
            break;
          }

          // Bad request
          case 400: {
            console.error(`Bad request ${prefix}:${desc}`);
            break;
          }

          default:
            console.error(
              `Other Telegram API error ${prefix} (code ${e.error_code}): ${desc} ${params}`,
            );
        }
      } else if (e instanceof HttpError) {
        console.error(`Network/HTTP error ${prefix}:`, e);
      } else {
        console.error(`Unexpected error ${prefix}:`, e);
      }
    });
  }

  private setupHandlers(bot: Bot): void {
    registerCommands(bot);

    bot.on("callback_query:data", async (ctx) => {
      const payload = ctx.callbackQuery.data;
      console.warn("Unknown button event with payload", {
        payload,
        timestamp: formatRussianDateTime(new Date()),
      });
      await ctx.answerCallbackQuery({
        text: "Необработанное действие 😥",
      });
    });
  }

  async startPolling(bot: Bot): Promise<void> {
    try {
      bot.start();
      this.mode = "polling";
      console.warn("Bot started in polling mode");
    } catch (error) {
      console.error(
        "Startup error:",
        error instanceof Error ? error.stack : error,
      );
    }
  }

  async stop(bot: Bot): Promise<void> {
    if (!this.isRunning) {
      console.error("Bot not running, nothing to stop");
      return;
    }

    try {
      await bot.stop();
      this.mode = null;
      console.warn("Bot stopped gracefully");
    } catch (error) {
      console.error(
        "Error stopping bot:",
        error instanceof Error ? error.stack : error,
      );
    }
  }

  async handleWebhookUpdate(bot: Bot, update: Update): Promise<void> {
    await bot.handleUpdate(update);
  }

  async setWebhook(bot: Bot, url: string): Promise<void> {
    const secret = config.telegram.webhookSecret;

    try {
      await bot.api.setWebhook(url, { secret_token: secret || undefined });
      this.mode = "webhook";
      if (secret) {
        console.warn(
          `✅ Webhook configured: ${url}  (secret token protection enabled)`,
        );
      } else {
        console.warn(
          `⚠ Webhook configured: ${url}  (NO secret token — less secure)`,
        );
      }
    } catch (error) {
      console.error("Failed to set webhook:", error);
      throw error;
    }
  }

  async deleteWebhook(bot: Bot): Promise<void> {
    try {
      await bot.api.deleteWebhook();
      console.warn("Webhook deleted");
    } catch (error) {
      console.error("Failed to delete webhook:", error);
      throw error;
    }
  }

  async getWebhookInfo(bot: Bot) {
    return await bot.api.getWebhookInfo();
  }
}

export const getBotManager = () => BotManager.getInstance();
