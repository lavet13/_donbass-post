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
import { prisma } from "@/prisma";
import { parseInteger } from "@/utils/parse";
import type { TrackGlobalResponse } from "@/track-global/types";
import { isFresh, slimTrackData } from "@/track-global/service";
import type { Prisma } from "@/lib/prisma/client";
import { makeProxyDispatcher } from "@/utils/proxy";
import { fetch } from "undici";
import { AliexpressTestSchema } from "@/orders/schemas";
import { prismaMysql } from "@/prisma/mysql";

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

  router.get("/api/track-global", async (request) => {
    if (!config.trackGlobal.key || !config.trackGlobal.bearer)
      return error("tracking not configured", { status: 503 });

    // read + normalize the key so " ab12 " and "AB12" share ONE cache row
    const track = new URL(request.url).searchParams
      .get("track")
      ?.trim()
      .toUpperCase();
    if (!track) return error("track query param required");

    // cache-first: a single primary-key lookup, zero upstream cost
    const cached = await prisma.trackGlobalCache.findUnique({
      where: { track },
    });
    if (cached && isFresh(cached)) {
      return Response.json({ source: "cached", data: cached.payload });
    }

    const dispatcher = makeProxyDispatcher(config.trackGlobal.proxy);

    let res: Response;
    try {
      res = await fetch(
        `https://${config.trackGlobal.host}/search?track=${encodeURIComponent(track)}`,
        {
          headers: {
            "x-rapidapi-key": config.trackGlobal.key,
            "x-rapidapi-host": config.trackGlobal.host,
            Authorization: `Bearer ${config.trackGlobal.bearer}`, // the 401 proved this is required too
          },
          dispatcher,
        },
      );
    } catch (err) {
      console.error("track-global fetch failed:", err);
      // fetch REJECTS only on a network failure — request never reached RapidAPI.
      // Better to hand back a stale parcel than nothing, if we have one.
      if (cached)
        return Response.json({ source: "stale", data: cached.payload });
      return error("tracking service unreachable", { status: 503 });
    }

    // headers are present regardless of status code
    const rateLimit = {
      remaining: headerInt(res.headers, "x-ratelimit-requests-remaining"),
      limit: headerInt(res.headers, "x-ratelimit-requests-limit"),
      resetSec: headerInt(res.headers, "x-ratelimit-requests-reset"),
    };
    console.warn(
      `track-global quota: ${rateLimit.remaining}/${rateLimit.limit}, resets in ${rateLimit.resetSec}s`,
    );

    // quota gone: RapidAPI 429s once the certain amount of requests are spent
    if (res.status === 429) {
      if (cached)
        return Response.json({
          source: "stale",
          data: cached.payload,
          quotaResetSec: rateLimit.resetSec,
        });
      return Response.json(
        {
          error: "Дневной лимит проверок исчерпан, попробуйте позже",
          quotaResetSec: rateLimit.resetSec,
        },
        { status: 429 },
      );
    }

    // any other non-2xx (bad creds, upstream 5xx): surface it, DON'T cache garbage
    if (!res.ok) {
      const detail = await res.text().catch(() => ""); // read the body once; .catch guards empty/non-JSON
      console.error(
        `track-global upstream ${res.status}: ${detail.slice(0, 300)}`,
      ); // cap the log line
      return error(`upstream error ${res.status}`, { status: 502 });
    }

    // success -> write cache, then serve. status:1 = real hit, 0 = not found (cache briefly)
    const body = (await res.json()) as TrackGlobalResponse;
    const found = body.data?.status === 1;
    const slim = slimTrackData(body.data);
    const payload = slim as unknown as Prisma.InputJsonValue;
    await prisma.trackGlobalCache.upsert({
      where: { track },
      create: { track, payload, found },
      update: { payload, found, fetchedAt: new Date() }, // bump the freshness clock
    });

    return Response.json({ source: "live", data: slim });
  });

  // Order forms
  router.post(
    "/api/orders/aliexpress-rostov",
    (req) =>
      handleOrder({
        request: req,
        schema: AliexpressTestSchema,
        writeOrder: (d) =>
          prismaMysql.orders_aliexpress
            .create({
              data: {
                name: d.name,
                phone: d.phone,
                mail: d.mail ?? "",
                departament: d.departament,
                links: d.links,
                amount: d.amount,
                track_number: d.track_number,
                VIP: d.VIP,
                // legacy NOT NULL columns this form doesn't use — empty, matching prod
                passport: "",
                vidan: "",
                kogda: "",
                pasldnr: "",
                name_Otpravitelya: "",
                TK: "",
                citi_otprav: "",
                phone_otprav: "",
                kto_oplachivaet: "",
                opisanie: "",
              },
            })
            .then(() => {}),
        label: "aliexpress-rostov",
      }),
    requireJSON,
  );

  const PICKUP_POINTS = [{"id":24,"name":"Алчевск ЛНР ","shortName":null,"address":"ул.Гмыри, 55 (ТРЦ \"Столица\", 0-й этаж)","mobilePoint":false,"workTime":"","city":{"id":8},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":6,"name":"Амвросиевка ДНР * Моб. отд.","shortName":null,"address":"Автовокзал (ул Мичурина 34)","mobilePoint":true,"workTime":null,"city":{"id":23},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":50,"name":"Антрацит ЛНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. ул. Ростовская, 1 (автовокзал)","mobilePoint":true,"workTime":null,"city":{"id":40},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":10,"name":"Брянка ЛНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. ул. Котовского, 1А (автовокзал)","mobilePoint":true,"workTime":null,"city":{"id":27},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":83,"name":"Волноваха ДНР * Моб. отд.","shortName":null,"address":"не фиксированный","mobilePoint":true,"workTime":null,"city":{"id":79},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":75,"name":"Володарское ДНР * Моб. отд.","shortName":null,"address":"не фиксированный","mobilePoint":true,"workTime":null,"city":{"id":71},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":49,"name":"Горловка ДНР","shortName":null,"address":"пр-т Победы, 2Б (остановка Украина, напротив магазина \"Планета\")","mobilePoint":false,"workTime":null,"city":{"id":3},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":40,"name":"Дебальцево ДНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. ул. Советская 77 (напротив \"Центрального Республиканского Банка\")","mobilePoint":true,"workTime":null,"city":{"id":32},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":34,"name":"Докучаевск ДНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. ул. Октябрьская","mobilePoint":true,"workTime":null,"city":{"id":39},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":15,"name":"Донецк-1 ДНР","shortName":"ДОН1","address":"пр-т Труда, 26б, павильон 2.(р-н ЦУМа)","mobilePoint":false,"workTime":"","city":{"id":2},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":16,"name":"Донецк-2 ДНР","shortName":"ДОН 2","address":"ул. 50-летия СССР, 158А, офис 9 (Крытый рынок)","mobilePoint":false,"workTime":null,"city":{"id":2},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":35,"name":"Еленовка ДНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. ул. Лесопарковая","mobilePoint":true,"workTime":null,"city":{"id":43},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":21,"name":"Енакиево ДНР ","shortName":null,"address":"ул. Щербакова, 147 ТЦ \"Мираж\" трамвайная остановка \"Строитель\"","mobilePoint":false,"workTime":null,"city":{"id":4},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":48,"name":"Ждановка ДНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. Здание ЦРБ напротив Андреевской церкви","mobilePoint":true,"workTime":null,"city":{"id":46},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":42,"name":"Зугрэс ДНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. Автовокзал","mobilePoint":true,"workTime":null,"city":{"id":33},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":38,"name":"Иловайск ДНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. ул Щорса 2 (Автовокзал)","mobilePoint":true,"workTime":null,"city":{"id":34},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":13,"name":"Кировское ДНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. ул. Ленина, 16 (автовокзал)","mobilePoint":true,"workTime":null,"city":{"id":45},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":14,"name":"Красный Луч ЛНР ","shortName":null,"address":"Мобильный пункт выдачи. Луганское шоссе, 14 (автовокзал)","mobilePoint":false,"workTime":null,"city":{"id":30},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":39,"name":"Кутейниково ДНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. Продуктовый рынок","mobilePoint":true,"workTime":null,"city":{"id":38},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":23,"name":"Луганск ЛНР","shortName":null,"address":"ул. Рислянда 3","mobilePoint":false,"workTime":null,"city":{"id":9},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":9,"name":"Лутугино ЛНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. ул. Ленина, 10 (автовокзал)","mobilePoint":true,"workTime":null,"city":{"id":26},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":25,"name":"Макеевка-1 ДНР","shortName":"МАК-1","address":"ул. Московская 29/48 (остановка бывшая Вареничная)","mobilePoint":false,"workTime":null,"city":{"id":1},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":71,"name":"Мангуш ДНР * Моб. отд.","shortName":null,"address":"не фиксированный","mobilePoint":true,"workTime":null,"city":{"id":67},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":57,"name":"Мариуполь-2 ДНР","shortName":null,"address":"ул.Строителей, 60 Пересечение улиц Строителей и Бахчиванджи. (рынок Застава)","mobilePoint":false,"workTime":null,"city":{"id":7},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":53,"name":"Молодогвардейск ЛНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. ост. Славутич","mobilePoint":true,"workTime":null,"city":{"id":49},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":65,"name":"Москва","shortName":null,"address":"ул.Перерва(дублер), д43,первый этаж, помещение VI комната 7,8 Ориентиры: Станция метро Братиславская","mobilePoint":false,"workTime":null,"city":{"id":15},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":84,"name":"Моспино ДНР * Моб. отд.","shortName":null,"address":"не фиксированный","mobilePoint":true,"workTime":null,"city":{"id":80},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":36,"name":"Нижняя Крынка ДНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. Центральная улица 18 (Поселковый совет)","mobilePoint":true,"workTime":null,"city":{"id":37},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":76,"name":"Новоазовск ДНР * Моб. отд.","shortName":null,"address":"не фиксированный","mobilePoint":true,"workTime":null,"city":{"id":72},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":5,"name":"Новый Свет ДНР * Моб. отд.","shortName":null,"address":"Автостанция","mobilePoint":true,"workTime":null,"city":{"id":22},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":3,"name":"Пантелеймоновка ДНР * Моб. отд.","shortName":null,"address":"ул.Виноградная, мк-н Черемушки (Продуктовый рынок)","mobilePoint":true,"workTime":null,"city":{"id":20},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":68,"name":"Первомайск ЛНР * Моб. отд.","shortName":null,"address":"не фиксированный","mobilePoint":true,"workTime":null,"city":{"id":64},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":12,"name":"Перевальск ЛНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. ул. 19 Партсъезда (автовокзал)","mobilePoint":true,"workTime":null,"city":{"id":28},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":62,"name":"Ростов-на-Дону-1","shortName":"РНД1 Малина","address":"ул. Малиновского, 5А","mobilePoint":false,"workTime":null,"city":{"id":16},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":70,"name":"Сартана ДНР * Моб. отд.","shortName":null,"address":"не фиксированный","mobilePoint":true,"workTime":null,"city":{"id":66},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":99,"name":"Снежное ДНР","shortName":null,"address":"площадь 50 лет Октября, д. 1 (Ориентир кафе \"Варна\" 1 этаж)","mobilePoint":false,"workTime":null,"city":{"id":31},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":95,"name":"Старобельск ЛНР * Моб. отд.","shortName":null,"address":"не фиксированный","mobilePoint":true,"workTime":null,"city":{"id":91},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":18,"name":"Старобешево ДНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. Автовокзал","mobilePoint":true,"workTime":"","city":{"id":52},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":22,"name":"Стаханов ЛНР *","shortName":null,"address":"ул. Дзержинского, 7 (ориентир - школа №28)","mobilePoint":false,"workTime":null,"city":{"id":10},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":46,"name":"Торез ДНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. пр-т Гагарина (возле памятника \"Пионерам угольного комбайна\")","mobilePoint":true,"workTime":"","city":{"id":36},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":41,"name":"Углегорск ДНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. ул. Некрасова 34 (\"Первый Республиканский Супермаркет\")","mobilePoint":true,"workTime":null,"city":{"id":35},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":8,"name":"Харцызск ДНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи. Октябрьская ул., 34Б  (Автовокзал)","mobilePoint":true,"workTime":null,"city":{"id":25},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":20,"name":"Шахтерск ДНР *","shortName":null,"address":"ул. Крупской, 1 (здание Автовокзала)","mobilePoint":false,"workTime":null,"city":{"id":5},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":67,"name":"Юбилейное ЛНР * Моб. отд.","shortName":null,"address":"не фиксированный","mobilePoint":true,"workTime":null,"city":{"id":63},"deliveryCompany":{"name":"ТК \"Наша Почта\""}},{"id":19,"name":"Ясиноватая ДНР * Моб. отд.","shortName":null,"address":"Мобильный пункт выдачи","mobilePoint":true,"workTime":null,"city":{"id":6},"deliveryCompany":{"name":"ТК \"Наша Почта\""}}];
  const DELIVERY_COMPANIES = [{"id":1,"name":"ТК \"Наша Почта\""},{"id":2,"name":"ЭНЕРГИЯ"},{"id":3,"name":"СДЭК"},{"id":4,"name":"ПЭК"},{"id":5,"name":"Деловые линии"},{"id":6,"name":"ЖелДор"},{"id":7,"name":"DPD"},{"id":8,"name":"Почта России"},{"id":9,"name":"БСД"}];

  router.get("/api/point/post", () => Response.json(PICKUP_POINTS));
  router.get("/api/delivery-company", () => Response.json(DELIVERY_COMPANIES));

  return router;
}

function headerInt(headers: Headers, name: string): number | null {
  return parseInteger(headers.get(name));
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

async function handleOrder<T>({
  request,
  schema,
  writeOrder,
  send,
  label,
}: {
  request: Request;
  schema: z.ZodType<T>;
  writeOrder: (data: T) => Promise<void>; // the MySQL insert — form-specific
  send?: (payload: T) => Promise<NotificationResult>; // the notify — reuses existing notifiers
  label: string;
}): Promise<Response> {
  try {
    const body = await parseJSON(request);
    const parsed = parseBody(schema, body);
    if (!parsed.success) return parsed.response; // 400 with zod's message

    // THE GATE: write to MySQL first. If this throws, the whole request fails —
    // no point notifying about an order that wasn't recorded.
    try {
      await writeOrder(parsed.data);
    } catch (dbErr) {
      console.error(`[orders/${label}] DB write failed:`, dbErr);
      return error("Не удалось сохранить заявку", { status: 500 });
    }

    // BEST-EFFORT: order is saved. Notify managers, but a notify failure
    // does NOT fail the request — the order IS in the system.
    if (send) {
      let notifyStatus: {
        sent: number;
        failed: number;
        skipped: number;
        error?: boolean;
      };
      try {
        const result = await send(parsed.data);
        notifyStatus = {
          sent: result.sent,
          failed: result.failed,
          skipped: result.skipped,
        };
      } catch (notifyErr) {
        console.error(
          `[orders/${label}] notify failed (order still saved):`,
          notifyErr,
        );
        notifyStatus = { sent: 0, failed: 0, skipped: 0, error: true };
      }

      return Response.json({
        success: true,
        message: "Заявка принята",
        notify: notifyStatus,
      });
    }

    return Response.json({
      success: true,
      message: "Заявка принята",
    });
  } catch (err) {
    console.error(`Error in /api/orders/${label}:`, err);
    if (err instanceof Error && err.message === "Invalid JSON body")
      return error("Invalid JSON body");
    return error("Internal server error", { status: 500 });
  }
}
