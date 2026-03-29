export type RouteHandler = (request: Request) => Response | Promise<Response>;
export type Middleware = (
  request: Request,
  next: () => Promise<Response>,
) => Promise<Response>;
export interface Route {
  handler: RouteHandler;
  middlewares: Middleware[];
}

export function createRouter() {
  const routes = new Map<string, Map<string, Route>>();
  const globalMiddlewares: Middleware[] = [];

  /**
   * Execute middleware chain
   * This is the "recursive next()" pattern
   */
  async function executeMiddlwares(
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

        return await executeMiddlwares(request, allMiddlewares, route.handler);
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
  message: string,
  init: ResponseInit | undefined = { status: 400 },
) {
  return Response.json({ error: message }, init);
}

export async function parseJSON<T = any>(request: Request): Promise<T> {
  try {
    return await (<T>request.json());
  } catch {
    throw new Error("Invalid JSON body");
  }
}
