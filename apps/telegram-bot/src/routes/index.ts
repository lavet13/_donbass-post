import { getBotManager } from "@/bot";
import { config } from "@/config";
import { cors, handleOptions, requireJSON } from "@/middleware";
import { getRouter, Router, error, parseJSON, json } from "@/router";
import { notifyOnlinePickup } from "@/services/notification.service";
import type { OnlinePickupPayload } from "@/types/notifications";
import type { Update } from "grammy/types";

export function createRoutes(): Router {
  const botManager = getBotManager();
  const router = getRouter();
  const bot = botManager.getBot();

  if (!bot) {
    throw new Error("Bot not initialized");
  }

  // Preflight requests
  router.use(handleOptions);

  router.use(cors);

  // Logging middleware
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
    return json({
      status: "ok",
      bot: botManager.isRunning() ? "running" : "stopped",
      timestamp: new Date().toISOString(),
    });
  });

  router.get("/stats", (_request) => {
    const memoryUsage = process.memoryUsage();

    return json({
      uptime: Math.floor(process.uptime()),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      },
      node_version: process.version,
      platform: process.platform,
    });
  });

  // Webhook endpoint for Telegram
  // To use this, you need to set webhook URL via Telegram Bot API:
  // https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-domain.com/webhook
  router.post("/webhook", async (request) => {
    // 1. Only allow webhook mode at all
    if (!config.telegram.useWebhook)
      return new Response("This endpoint is only available in webhook mode", {
        status: 403,
        headers: {
          "Content-Type": "text/plain",
        },
      });

    // 2. Secret token verification – do this as early as possible
    const receivedSecret = request.headers.get(
      "X-Telegram-Bot-Api-Secret-Token",
    );
    console.log({ receivedSecret });

    if (config.telegram.webhookSecret) {
      if (receivedSecret !== config.telegram.webhookSecret) {
        console.warn(
          `Webhook secret mismatch (possible spoofed request) — received: ${receivedSecret ? "present but wrong" : "missing"}`,
        );
        return new Response("Forbidden", { status: 403 });
      }
    } else {
      // No secret configured → log warning but proceed (not ideal, but graceful)
      console.warn("Webhook secret check skipped — WEBHOOK_SECRET not set");
    }

    if (!bot) {
      return new Response("Bot not initialized", { status: 503 });
    }

    try {
      const update = (await request.json()) as Update;

      // Handle the update using grammy's handleUpdate method
      await botManager.handleWebhookUpdate(update);

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Webhook processing error:", error);
      return new Response("Error processing update", { status: 500 });
    }
  });

  router.get("/webhook/info", async (_request) => {
    try {
      const info = await botManager.getWebhookInfo();
      return json(info);
    } catch (error) {
      console.error("Error getting webhook info:", error);
      return new Response("Error getting webhook info", { status: 500 });
    }
  });

  router.get("/", (_request) => {
    return json({
      service: "Telegram Bot Server",
      version: "1.0.0",
      endpoints: [
        "GET /health - Health check",
        "GET /stats - Server statistics",
        "POST /webhook - Telegram webhook handler",
        "GET /webhook/info - Get webhook info",
        "GET / - This info",
      ],
    });
  });

  router.post(
    "/api/notify/online-pickup",
    async (request) => {
      try {
        const payload = await parseJSON<OnlinePickupPayload>(request);

        const requiredFields = [
          "surnameSender",
          "nameSender",
          "patronymicSender",
          "phoneSender",
          "cityRegion",
          "pickupAddress",
          "pickupTime",
          "totalWeight",
          "cubicMeter",
          "description",
          "surnameRecipient",
          "nameRecipient",
          "patronymicRecipient",
          "phoneRecipient",
          "emailRecipient",
          "shippingPayment",
        ];

        const missingFields = requiredFields.filter(
          (field) => !payload[field as keyof OnlinePickupPayload],
        );

        if (missingFields.length > 0) {
          return error(
            `Missing required fields: ${missingFields.join(", ")}`,
            400,
          );
        }

        const result = await notifyOnlinePickup(bot, payload);

        if (!result.success) {
          console.error("Failed to send notifications:", result.errors);
          return error("Failed to send notifications to managers", 500);
        }

        return json({
          success: true,
          message: "Notification sent successfully",
          status: {
            sent: result.sent,
            failed: result.failed,
          },
        });
      } catch (err) {
        console.error("Error in /api/notify/online-pickup:", err);

        if (err instanceof Error && err.message === "Invalid JSON body") {
          return error("Invalid JSON body:", 400);
        }

        return error("Internal server error:", 500);
      }
    },
    requireJSON,
  );

  return router;
}
