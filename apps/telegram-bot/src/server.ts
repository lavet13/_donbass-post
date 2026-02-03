import "@/env";
import { serve } from "srvx/node";
import { createRoutes } from "@/routes";
import { getBotManager } from "@/bot";
import { config, validateConfig } from "@/config";

async function startApp() {
  try {
    validateConfig(config);
  } catch (error) {
    console.error("❌ Configuration validation failed:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  const botManager = getBotManager();

  try {
    await botManager.initialize(config.telegram.token);

    if (config.telegram.useWebhook) {
      console.warn("🔗 Setting up webhook mode...");
      try {
        await botManager.deleteWebhook();
        await botManager.setWebhook(config.telegram.webhookUrl);

        const webhookInfo = await botManager.getWebhookInfo();

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
        await botManager.startPolling();
      }
    } else {
      console.warn("📡 Using polling mode...");
      await botManager.startPolling();
    }

    const router = createRoutes();

    const server = serve({
      fetch: (request) => router.handle(request),
      port: config.server.port,
    });

    await server.ready();

    console.warn(`📊 Bot mode: ${botManager.getMode()}`);
    console.warn(`🌍 Environment: ${config.server.nodeEnv}`);
    console.warn(
      `👥 Managers configured: ${config.managers.getChatIds().length}`,
    );

    const shutdown = async () => {
      console.warn("\nShutting down gracefully...");
      await botManager.stop();
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
