import { serve } from "srvx/node";
import { createRoutes } from "@/routes";
import { getBotManager } from "@/bot";
import { config, validateNotificationTypes } from "@/config";
import { getAllManagers } from "./managers/service";

async function startApp() {
  const botManager = getBotManager();

  try {
    await botManager.initialize(config.telegram.token);
    await validateNotificationTypes();

    const bot = botManager.getBot();

    if (config.telegram.useWebhook) {
      console.warn("🔗 Setting up webhook mode...");
      try {
        await botManager.deleteWebhook(bot);
        await botManager.setWebhook(
          bot,
          config.telegram.webhookUrl,
          config.telegram.webhookSecret,
        );

        const webhookInfo = await botManager.getWebhookInfo(bot);

        if (webhookInfo.url === config.telegram.webhookUrl) {
          console.warn(
            `✅ Webhook verified and active: ${config.telegram.webhookUrl}`,
          );
        } else {
          throw new Error(
            `Webhook verification failed. Expected: ${config.telegram.webhookUrl}, Got: ${webhookInfo.url}`,
          );
        }
      } catch (error) {
        console.error(`❌ Failed to set webhook, switching to polling...`);
        console.error(
          `Error details: ${error instanceof Error ? error.stack : error}`,
        );
        await botManager.startPolling(bot);
      }
    } else {
      console.warn("📡 Using polling mode...");
      await botManager.startPolling(bot);
    }

    const router = createRoutes(bot);
    if (config.server.nodeEnv === "development") {
      console.log(router.getRoutes());
    }

    const server = serve({
      fetch: (request) => router.handle(request),
      port: config.server.port,
    });

    await server.ready();

    console.warn(`📊 Bot mode: ${botManager.getMode()}`);
    console.warn(`🌍 Environment: ${config.server.nodeEnv}`);
    console.warn(`👥 Managers configured: ${(await getAllManagers()).length}`);

    const shutdown = async () => {
      console.warn("\nShutting down gracefully...");
      await botManager.stop(bot);
      process.exit(0);
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
}

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

startApp();
