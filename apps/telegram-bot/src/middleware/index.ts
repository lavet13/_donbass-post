import type { Middleware } from "@/router";
import { error } from "@/router";

/**
 * CORS Configuration
 *
 * Define allowed origins here - this is the single source of truth
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
 *
 * This allows Telegram webhook requests (no Origin header)
 * and your configured domains
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
    "Access-Control-Allow-Methods": CORS_CONFIG.allowedMethods.join(", "),
    "Access-Control-Allow-Headers": CORS_CONFIG.allowedHeaders.join(", "),
    "Access-Control-Max-Age": CORS_CONFIG.maxAge.toString(),
  };

  headers["Vary"] = "Origin";

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
 * What is OPTIONS?
 * ----------------
 * Before making a "complex" request (POST with custom headers),
 * browsers send an OPTIONS request to check if CORS allows it.
 * This is called a "preflight request".
 *
 * Example flow:
 * 1. Browser wants to POST to /api/notify/online-pickup
 * 2. Browser first sends: OPTIONS /api/notify/online-pickup
 * 3. Server responds with CORS headers saying "yes, this is allowed"
 * 4. Browser then sends the actual POST request
 *
 * We handle OPTIONS early to avoid running unnecessary middleware/validation.
 */
export const handleOptions: Middleware = async (request, next) => {
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("Origin");

    // Check if origin is allowed
    if (origin && !isOriginAllowed(origin)) {
      return new Response("Origin not allowed", {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return 204 No Content with CORS headers
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  // Not an OPTIONS request, continue
  return next();
};

/**
 * Add CORS headers to actual responses
 *
 * This middleware:
 * 1. Checks if origin is allowed
 * 2. Calls next() to get the response
 * 3. Adds CORS headers to the response
 *
 * Note: Telegram webhook requests have no Origin header,
 * so they pass through without CORS restrictions.
 */
export const cors: Middleware = async (request, next) => {
  const origin = request.headers.get("Origin");

  // Check if origin is allowed (skip for no-origin requests like Telegram)
  if (origin && !isOriginAllowed(origin)) {
    return new Response("Origin not allowed", {
      status: 403,
      headers: { "Content-Type": "application/json" },
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
    return error("Content-Type must be application/json");
  }

  return next();
};
