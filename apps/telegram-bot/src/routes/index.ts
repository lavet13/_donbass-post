import { getBotManager, type TCustomBot } from "@/bot";
import { config } from "@/config";
import { cors, handleOptions, requireJSON } from "@/middleware";
import { createRouter, error, parseJSON, type Router } from "@/router";
import {
  notifyAliParcelPickup,
  notifyOnlinePickup,
  notifyPickUpPointDeliveryOrder,
  type NotificationResult,
} from "@/notifications/service";
import { NotificationTypes } from "@/notifications/notification-types";
import {
  AliParcelPickupSchema,
  PickUpPointDeliverySchema,
  OnlinePickupSchema,
} from "@/notifications/types";
import type { Update } from "grammy/types";
import { version } from "../../package.json";
import { parseBody } from "@/utils/validate";
import type z from "zod";

export function createRoutes(bot: TCustomBot): Router {
  const botManager = getBotManager();
  const router = createRouter();

  /**
   * When to enable:
   * - Local development without nginx
   * - Serverless deployments
   * - Testing CORS without reverse proxy
   *
   * To enable: modify below to `router.use(handleOptions);`
   */
  if (config.server.nodeEnv === "development") {
    router.use(handleOptions);
  }

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
    return Response.json({
      status: "ok",
      bot: botManager.isRunning() ? "running" : "stopped",
      timestamp: new Date().toISOString(),
    });
  });

  router.get("/stats", (_request) => {
    const memoryUsage = process.memoryUsage();

    return Response.json({
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

    // 2. Getting telegram bot api secret token from headers
    const receivedSecret = request.headers.get(
      "X-Telegram-Bot-Api-Secret-Token",
    );

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

    try {
      const update = (await request.json()) as Update;

      const bot = botManager.getBot();

      // Handle the update using grammy's handleUpdate method
      await botManager.handleWebhookUpdate(bot, update);

      return new Response("OK", { status: 200 });
    } catch (err) {
      console.error("Webhook processing error:", err);
      return new Response("Error processing update", { status: 500 });
    }
  });

  router.get("/webhook/info", async (_request) => {
    try {
      const bot = botManager.getBot();
      const info = await botManager.getWebhookInfo(bot);
      return Response.json(info);
    } catch (err) {
      console.error("Error getting webhook info:", err);
      return new Response("Error getting webhook info", { status: 500 });
    }
  });

  router.get("/", (_request) => {
    return Response.json({
      service: "Telegram Bot Server",
      version,
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
    `/api/notify/${NotificationTypes.ONLINE_PICKUP_RF}`,
    (req) =>
      handleNotify(
        req,
        OnlinePickupSchema,
        (p) => notifyOnlinePickup(bot, p),
        NotificationTypes.ONLINE_PICKUP_RF,
      ),
    requireJSON,
  );

  router.post(
    `/api/notify/${NotificationTypes.PICK_UP_POINT_DELIVERY}`,
    (req) =>
      handleNotify(
        req,
        PickUpPointDeliverySchema,
        (p) => notifyPickUpPointDeliveryOrder(bot, p),
        NotificationTypes.PICK_UP_POINT_DELIVERY,
      ),
    requireJSON,
  );

  router.post(
    `/api/notify/${NotificationTypes.ALI_PARCEL_PICKUP}`,
    (req) =>
      handleNotify(
        req,
        AliParcelPickupSchema,
        (p) => notifyAliParcelPickup(bot, p),
        NotificationTypes.ALI_PARCEL_PICKUP,
      ),
    requireJSON,
  );

  return router;
}

async function handleNotify<T>(
  request: Request,
  schema: z.ZodType<T>,
  send: (payload: T) => Promise<NotificationResult>,
  label: string,
): Promise<Response> {
  try {
    const body = await parseJSON(request);
    const parsed = parseBody(schema, body);
    if (!parsed.success) return parsed.response; // 400 with zod's message

    const result = await send(parsed.data);
    const status = {
      sent: result.sent,
      failed: result.failed,
      skipped: result.skipped,
    };

    if (result.sent === 0 && result.failed > 0)
      return error("Failed to send notifications to any manager", {
        status: 500,
      });

    return Response.json({
      success: true,
      message:
        result.failed > 0
          ? "Notification sent with some failures"
          : "Notification sent successfully",
      status,
      ...(result.failed > 0 && { warnings: result.errors }), // only include when there are failures
    });
  } catch (err) {
    console.error(`Error in /api/notify/${label}:`, err);
    if (err instanceof Error && err.message === "Invalid JSON body")
      return error("Invalid JSON body");
    return error("Internal server error", { status: 500 });
  }
}
