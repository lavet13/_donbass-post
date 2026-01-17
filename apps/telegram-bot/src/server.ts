import { serve } from "srvx/node";

const server = serve({
  fetch: (_request) => {
    return new Response("Hello");
  },
});

await server.ready();

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
