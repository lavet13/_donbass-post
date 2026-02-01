import { Bot, Context, GrammyError, HttpError } from "grammy";
import { formatRussianDateTime } from "@/utils";
import { autoRetry } from "@grammyjs/auto-retry";

export type TCustomBot = Bot<Context> & {};

export class BotManager {
  private static instance: BotManager | null = null;
  private bot: TCustomBot | null = null;
  private isStarted = false;
  private mode: "webhook" | "polling" | null = null;

  private constructor() {}

  static getInstance(): BotManager {
    if (!BotManager.instance) {
      BotManager.instance = new BotManager();
    }
    return BotManager.instance;
  }

  getBot(): TCustomBot | null {
    return this.bot;
  }

  isRunning(): boolean {
    return this.isStarted && this.bot !== null;
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

      this.setupErrorHandling();
      this.setupHandlers();

      console.warn("Bot initialized successfully");
    } catch (error) {
      console.error("Failed to initialize bot:", error);
      throw error;
    }
  }

  private setupErrorHandling(): void {
    if (!this.bot) {
      throw new Error("Bot not initialized");
    }

    this.bot.catch((err) => {
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

  private setupHandlers(): void {
    if (!this.bot) {
      throw new Error("Bot not initialized");
    }

    // Start command
    this.bot.command("start", async (ctx) => {
      await ctx.reply(
        "👋 Привет! Я бот Донбасс Пост.\n\n" +
          "Доступные команды:\n" +
          "/start - Начать работу\n" +
          "/help - Помощь\n" +
          "/status - Статус бота",
      );
    });

    // Help command
    this.bot.command("help", async (ctx) => {
      await ctx.reply(
        "ℹ️ Помощь:\n\n" +
          "Этот бот помогает с новостями Донбасса.\n" +
          "Используйте /start для начала работы.",
      );
    });

    // Status command
    this.bot.command("status", async (ctx) => {
      const uptime = Math.floor(process.uptime());
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);

      await ctx.reply(
        `✅ Бот работает\n\n` +
          `⏱ Время работы: ${hours}ч ${minutes}м\n` +
          `🤖 Версия: 1.0.0\n` +
          `📡 Режим: ${this.mode || "неизвестен"}`,
      );
    });

    this.bot.on("callback_query:data", async (ctx) => {
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

  async startPolling(): Promise<void> {
    if (!this.bot) {
      throw new Error("Bot not initialized");
    }

    try {
      this.bot.start();
      this.isStarted = true;
      this.mode = "polling";
      console.warn("Bot started in polling mode");
    } catch (error) {
      console.error(
        "Startup error:",
        error instanceof Error ? error.stack : error,
      );
    }
  }

  async stop(): Promise<void> {
    if (!this.bot || !this.isStarted) {
      console.error("Bot not running, nothing to stop");
      return;
    }

    try {
      await this.bot.stop();
      this.isStarted = false;
      this.mode = null;
      console.warn("Bot stopped gracefully");
    } catch (error) {
      console.error(
        "Error stopping bot:",
        error instanceof Error ? error.stack : error,
      );
    }
  }

  async handleWebhookUpdate(update: any): Promise<void> {
    if (!this.bot) {
      throw new Error("Bot not initialized");
    }

    await this.bot.handleUpdate(update);
  }

  async setWebhook(url: string): Promise<void> {
    if (!this.bot) {
      throw new Error("Bot not initialized");
    }

    try {
      await this.bot.api.setWebhook(url);
      this.isStarted = true;
      this.mode = "webhook";
      console.warn(`✅ Webhook configured: ${url}`);
    } catch (error) {
      console.error("Failed to set webhook:", error);
      throw error;
    }
  }

  async deleteWebhook(): Promise<void> {
    if (!this.bot) {
      throw new Error("Bot not initialized");
    }

    try {
      await this.bot.api.deleteWebhook();
      console.warn("Webhook deleted");
    } catch (error) {
      console.error("Failed to delete webhook:", error);
      throw error;
    }
  }

  async getWebhookInfo() {
    if (!this.bot) {
      throw new Error("Bot not initialized");
    }

    return await this.bot.api.getWebhookInfo();
  }
}

export const getBotManager = () => BotManager.getInstance();
