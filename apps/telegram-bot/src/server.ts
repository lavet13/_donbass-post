import "@/env";
import { serve } from "srvx/node";
import { getBotManager } from "@/bot";
import { router } from "@/router";
import type { Update } from "grammy/types";

const botManager = getBotManager();

router.get("/health", (_request) => {
  return new Response(
    JSON.stringify({
      status: "ok",
      bot: botManager.isRunning() ? "running" : "stopped",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
});

router.get("/stats", (_request) => {
  const memoryUsage = process.memoryUsage();

  return new Response(
    JSON.stringify({
      uptime: Math.floor(process.uptime()),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      },
      node_version: process.version,
      platform: process.platform,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
});

// Webhook endpoint for Telegram
// To use this, you need to set webhook URL via Telegram Bot API:
// https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-domain.com/webhook
router.post("/webhook", async (request) => {
  if (!botManager.getBot()) {
    return new Response("Bot not initialized", { status: 503 });
  }

  try {
    const update = (await request.json()) as Update;

    // Handle the update using grammy's handleUpdate method
    await botManager.handleWebhookUpdate(update);

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Error processing update", { status: 500 });
  }
});

router.get("/webhook/info", async (_request) => {
  try {
    const info = await botManager.getWebhookInfo();
    return new Response(JSON.stringify(info, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error getting webhook info:", error);
    return new Response("Error getting webhook info", { status: 500 });
  }
});

router.get("/", (_request) => {
  return new Response(
    JSON.stringify({
      service: "Telegram Bot Server",
      version: "1.0.0",
      endpoints: [
        "GET /health - Health check",
        "GET /stats - Server statistics",
        "POST /webhook - Telegram webhook handler",
        "GET /webhook/info - Get webhook info",
        "GET / - This info",
      ],
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
});

async function startApp() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN environment variable is required");
    process.exit(1);
  }

  try {
    await botManager.initialize(token);

    await botManager.startPolling();

    // For webhook mode, uncomment these lines instead:
    // const webhookUrl = process.env.WEBHOOK_URL || "https://your-domain.com/webhook";
    // await botManager.deleteWebhook(); // Clean up any existing webhook
    // await botManager.setWebhook(webhookUrl);

    const server = serve({
      fetch: async (request) => {
        const startTime = Date.now();
        const url = new URL(request.url);

        if (process.env.NODE_ENV === "development") {
          console.warn(`${request.method} ${url.pathname}`);
        }

        const response = await router.handle(request);

        const duration = Date.now() - startTime;
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `${request.method} ${url.pathname} - ${response.status} (${duration}ms)`,
          );
        }

        return response;
      },
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
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
