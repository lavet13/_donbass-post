import { error, type Middleware } from "@/router";

/**
 * Middleware to validate request content type
 */
export const requireJSON: Middleware = async (request, next) => {
  const contentType = request.headers.get("Content-Type");

  if (!contentType?.includes("application/json")) {
    return error("Content-Type must be application/json", 400);
  }

  return next();
};

/**
 * Middleware for CORS
 */
export const cors: Middleware = async (_request, next) => {
  const response = await next();

  // Clone response to add headers
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

/**
 * Middleware to handle OPTIONS requests (preflight)
 */
export const handleOptions: Middleware = async (request, next) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-API-Secret, Authorization",
      },
    });
  }

  return next();
};
