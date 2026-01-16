import { serve } from "srvx/node";

const server = serve({
  fetch: (_request) => {
    return new Response("Hello");
  },
});

await server.ready();
