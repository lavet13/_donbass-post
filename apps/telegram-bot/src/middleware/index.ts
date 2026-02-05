import type { Middleware } from "@/router";
import { error } from "@/router";

/**
 * CORS Configuration
 *
 * NOTE: OPTIONS requests are handled by nginx for performance.
 * This middleware only adds CORS headers to actual responses.
 */
const CORS_CONFIG = {
  // Allowed origins - add your domains here
  allowedOrigins: [
    "https://donbass-post.ru",
    "https://donbass-post2.ru",
    "https://workplace-post.ru",
    "https://donbass-post.duckdns.org",

    // For local development
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:4173",
  ],

  // Allowed methods
  allowedMethods: ["GET", "POST", "OPTIONS"],

  // Allowed headers
  allowedHeaders: ["Content-Type", "Accept", "Origin", "X-Requested-With"],

  // Allow credentials (cookies, auth headers)
  allowCredentials: true,

  // Preflight cache duration (in seconds)
  maxAge: 86400, // 24 hours
};

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | null): boolean {
  // Allow requests with no Origin header (e.g., Telegram webhooks, curl, server-to-server)
  if (!origin) {
    return true;
  }

  // Check against allowed origins
  return CORS_CONFIG.allowedOrigins.includes(origin);
}

/**
 * Get appropriate CORS headers for the origin
 */
function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Vary: "Origin",
  };

  // Set origin dynamically based on request
  if (origin && isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;

    if (CORS_CONFIG.allowCredentials) {
      headers["Access-Control-Allow-Credentials"] = "true";
    }
  } else if (!origin) {
    // No origin header (Telegram, curl, etc.) - allow all
    headers["Access-Control-Allow-Origin"] = "*";
  }

  return headers;
}

/**
 * Handle OPTIONS preflight requests
 *
 * NOTE: Currently handled by nginx for performance.
 * This middleware is kept for development/testing or
 * deployments without a reverse proxy.
 *
 * To enable: router.use(handleOptions) in routes/index.ts
 */
export const handleOptions: Middleware = async (request, next) => {
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("Origin");

    // Check if origin is allowed
    if (origin && !isOriginAllowed(origin)) {
      return error("Origin not allowed", {
        status: 403,
      });
    }

    // Return 204 No Content with CORS headers
    return new Response(null, {
      status: 204,
      headers: {
        ...getCorsHeaders(origin),
        "Access-Control-Allow-Methods": CORS_CONFIG.allowedMethods.join(", "),
        "Access-Control-Allow-Headers": CORS_CONFIG.allowedHeaders.join(", "),
        "Access-Control-Max-Age": CORS_CONFIG.maxAge.toString(),
        "Content-Length": "0",
        "Content-Type": "text/plain",
      },
    });
  }

  // Not an OPTIONS request, continue
  return next();
};

/**
 * Add CORS headers to actual responses
 *
 * This middleware adds CORS headers to POST/GET responses.
 * OPTIONS preflight is handled by nginx.
 */
export const cors: Middleware = async (request, next) => {
  const origin = request.headers.get("Origin");

  // Check if origin is allowed (skip for no-origin requests like Telegram)
  if (origin && !isOriginAllowed(origin)) {
    return error("Origin not allowed", {
      status: 403,
    });
  }

  // Get the response from next middleware/handler
  const response = await next();

  // Clone response to add headers (Response is immutable)
  const headers = new Headers(response.headers);

  // Add CORS headers
  const corsHeaders = getCorsHeaders(origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  // Return new response with CORS headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

/**
 * Middleware to validate request content type
 */
export const requireJSON: Middleware = async (request, next) => {
  const contentType = request.headers.get("Content-Type");

  if (!contentType?.includes("application/json")) {
    return error("Content-Type must be application/json", { status: 415 });
  }

  return next();
};
