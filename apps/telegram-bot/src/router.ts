export type RouteHandler = (request: Request) => Response | Promise<Response>;
export type Middleware = (
  request: Request,
  next: () => Promise<Response>,
) => Promise<Response>;
export interface Route {
  handler: RouteHandler;
  middlewares: Middleware[];
}

/*
 * TODO: convert "/api/track/:track" → { regex: /^\/api\/track\/([^/]+)$/, keys: ["track"] }
 * then in handle(): loop routes, regex.exec(pathname), zip keys↔groups into request.params
 *
 * Router param-matching — the verbose spec to build from
 *
 * You'll implement this; here's the full sequence so you're not guessing. Four parts:
 *
 * 1. A pure compile function (this is the piece to write and unit-test first, in isolation — it touches nothing else):
 *
 * Input: a path string like /api/track/:track. Output: { regex: RegExp, keys: string[] }.
 * Split on /. For each segment: if it starts with :, push the name (minus the colon) into keys and emit the capture group ([^/]+) (one-or-more non-slash chars — a param can't span a slash). Otherwise it's a literal — escape any regex-special chars in it and emit it as-is.
 * Join with escaped slashes, wrap in ^…$ so it matches the whole path, not a prefix.
 * Falsifiable test for it: compile("/api/track/:track") must produce a regex where .exec("/api/track/ABC") captures "ABC" and .exec("/api/track/ABC/x") returns null. Write that test before wiring anything.
 *
 * 2. Change storage. Your current Map<method, Map<path, Route>> is O(1) exact lookup and can't regex-match. Keep it for static routes, and add a second structure for param routes: Map<method, Array<{ regex, keys, route }>> — an ordered array, because param matching is a linear scan, and order = precedence.
 *
 * 3. Change handle() matching. After your existing exact-Map lookup misses (static routes should win — they're more specific), scan the param array for that method: run each regex.exec(pathname), and on the first match, zip keys[i] to capture group match[i + 1] (group 0 is the whole match), running each captured value through decodeURIComponent. Build a params object from that.
 *
 * 4. Get params to the handler — the real decision. Request is immutable, so request.params = … throws. Two clean options, pick one and tell me why:
 *
 * (a) WeakMap side-channel: const paramStore = new WeakMap<Request, Params>(); set it before invoking the handler, expose a getParams(request) helper. Keeps your RouteHandler signature unchanged — middlewares don't care.
 * (b) Second argument: change RouteHandler to (request, params) => Response and thread params through executeMiddlewares. Cleaner data flow (no hidden global), but every handler and the middleware chain signature change.
 *
 * Edge cases to decide up front: trailing slashes (/x vs /x/ — normalize or not?), two param routes that could both match (first-registered wins, since you scan in order), and the query string — good news, it's not part of pathname, so ?track= never interferes with param matching. Send it when you've got it and I'll review the compile fn's regex escaping first (that's where these usually break).
 * */
export function createRouter() {
  const routes = new Map<string, Map<string, Route>>();
  const globalMiddlewares: Middleware[] = [];

  /**
   * Execute middleware chain
   * This is the "recursive next()" pattern
   */
  async function executeMiddlewares(
    request: Request,
    middlewares: Middleware[],
    handler: RouteHandler,
  ): Promise<Response> {
    let index = 0;

    const next = async (): Promise<Response> => {
      // If we still have middlewares to execute
      if (index < middlewares.length) {
        const middleware = middlewares[index++]!;
        // Call middleware with request and next function
        // The middleware can call next() to continue the chain
        return await middleware(request, next);
      }

      // NO more middlewares, execute the final handler
      return await handler(request);
    };

    return await next();
  }

  function add(
    method: string,
    path: string,
    handler: RouteHandler,
    middlewares: Middleware[] = [],
  ) {
    if (!routes.has(method)) {
      routes.set(method, new Map());
    }
    routes.get(method)!.set(path, { handler, middlewares });

    return router;
  }

  const router = {
    use(middleware: Middleware) {
      globalMiddlewares.push(middleware);
      return router;
    },

    get(path: string, handler: RouteHandler, ...middlewares: Middleware[]) {
      return add("GET", path, handler, middlewares);
    },

    post(path: string, handler: RouteHandler, ...middlewares: Middleware[]) {
      return add("POST", path, handler, middlewares);
    },
    put(path: string, handler: RouteHandler, ...middlewares: Middleware[]) {
      return add("PUT", path, handler, middlewares);
    },

    delete(path: string, handler: RouteHandler, ...middlewares: Middleware[]) {
      return add("DELETE", path, handler, middlewares);
    },

    patch(path: string, handler: RouteHandler, ...middlewares: Middleware[]) {
      return add("PATCH", path, handler, middlewares);
    },

    async handle(request: Request): Promise<Response> {
      const url = new URL(request.url);
      const method = request.method;
      const path = url.pathname;

      const methodRoutes = routes.get(method);
      if (!methodRoutes) {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const route = methodRoutes.get(path);
      if (!route) {
        return new Response(
          JSON.stringify({ error: "Not Found", path, method }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      try {
        // Combine global middlewares + route-specific middlewares
        const allMiddlewares = [...globalMiddlewares, ...route.middlewares];

        return await executeMiddlewares(request, allMiddlewares, route.handler);
      } catch (error) {
        console.error("Route handler error:", error);
        return new Response(
          JSON.stringify({
            error: "Internal Server Error",
            message: error instanceof Error ? error.message : "Unknown error",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    },

    getRoutes(): Array<{ method: string; path: string }> {
      const allRoutes: Array<{ method: string; path: string }> = [];

      routes.forEach((paths, method) => {
        paths.forEach((_, path) => {
          allRoutes.push({ method, path });
        });
      });

      return allRoutes;
    },
  };

  return router;
}

export type Router = ReturnType<typeof createRouter>;

export function error(
  message: string | object,
  init: ResponseInit | undefined = { status: 400 },
): Response {
  return Response.json({ error: message }, init);
}

export function validationError(fieldErrors: Record<string, string>): Response {
  return Response.json(
    { error: "Validation failed", fieldErrors },
    { status: 400 },
  );
}

export async function parseJSON<T = any>(request: Request): Promise<T> {
  try {
    return await (<T>request.json());
  } catch {
    throw new Error("Invalid JSON body");
  }
}
