import { getBotManager } from "@/bot";
import { getRouter, Router } from "@/router";
import type { Update } from "grammy/types";

export function createRoutes(): Router {
  const botManager = getBotManager();
  const router = getRouter();

  router.use(async (request, next) => {
    const startTime = Date.now();
    const url = new URL(request.url);

    console.warn(`📥 ${request.method} ${url.pathname}`);

    const response = await next();

    const duration = Date.now() - startTime;

    console.warn(
      `📤 ${request.method} ${url.pathname} - ${response.status} (${duration}ms)`,
    );

    return response;
  });

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

  return router;
}
