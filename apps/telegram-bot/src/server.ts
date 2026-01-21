import "@/env";
import { serve } from "srvx/node";
import { createRoutes } from "@/routes";
import { getBotManager } from "@/bot";

async function startApp() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN environment variable is required");
    process.exit(1);
  }

  const botManager = getBotManager();

  try {
    await botManager.initialize(token);

    const useWebhook = process.env.USE_WEBHOOK === "true";

    if (useWebhook) {
      const webhookUrl = process.env.WEBHOOK_URL;
      if (!webhookUrl) {
        console.error("WEBHOOK_URL is required when USE_WEBHOOK=true");
        process.exit(1);
      }

      console.warn("🔗 Setting up webhook mode...");
      try {
        await botManager.deleteWebhook();
        await botManager.setWebhook(webhookUrl);
      } catch (error) {
        console.error(
          `Failed to set webhook, switching to polling... The error: ${error instanceof Error ? error.stack : error}`,
        );
        await botManager.startPolling();
      }
      console.warn(`✅ Webhook set to: ${webhookUrl}`);
    } else {
      await botManager.startPolling();
    }

    const router = createRoutes();
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

    const server = serve({
      fetch: (request) => router.handle(request),
      port,
    });

    await server.ready();

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
