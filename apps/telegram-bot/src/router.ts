type RouteHandler = (request: Request) => Response | Promise<Response>;
export type Middleware = (
  request: Request,
  next: () => Promise<Response>,
) => Promise<Response>;

interface Route {
  handler: RouteHandler;
  middlewares: Middleware[];
}

class Router {
  private static instance: Router | null = null;
  private readonly routes = new Map<string, Map<string, Route>>();
  private readonly globalMiddlewares: Middleware[] = [];

  static getInstance(): Router {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  use(middleware: Middleware) {
    this.globalMiddlewares.push(middleware);
    return this;
  }

  private add(
    method: string,
    path: string,
    handler: RouteHandler,
    middlewares: Middleware[] = [],
  ): this {
    if (!this.routes.has(method)) {
      this.routes.set(method, new Map());
    }
    this.routes.get(method)!.set(path, { handler, middlewares });

    return this;
  }

  get(path: string, handler: RouteHandler, ...middlewares: Middleware[]): this {
    return this.add("GET", path, handler, middlewares);
  }

  post(
    path: string,
    handler: RouteHandler,
    ...middlewares: Middleware[]
  ): this {
    return this.add("POST", path, handler, middlewares);
  }

  put(path: string, handler: RouteHandler, ...middlewares: Middleware[]) {
    return this.add("PUT", path, handler, middlewares);
  }

  delete(path: string, handler: RouteHandler, ...middlewares: Middleware[]) {
    return this.add("DELETE", path, handler, middlewares);
  }

  patch(path: string, handler: RouteHandler, ...middlewares: Middleware[]) {
    return this.add("PATCH", path, handler, middlewares);
  }

  /**
   * Execute middleware chain
   * This is the "recursive next()" pattern
   */
  async executeMiddlwares(
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

  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    const methodRoutes = this.routes.get(method);
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
      const allMiddlewares = [...this.globalMiddlewares, ...route.middlewares];

      return await this.executeMiddlwares(
        request,
        allMiddlewares,
        route.handler,
      );
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
  }

  getRoutes(): Array<{ method: string; path: string }> {
    const allRoutes: Array<{ method: string; path: string }> = [];

    this.routes.forEach((paths, method) => {
      paths.forEach((_, path) => {
        allRoutes.push({ method, path });
      });
    });

    return allRoutes;
  }
}

export function json(data: any, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export function error(message: string, status = 400) {
  return json({ error: message }, status);
}

export async function parseJSON<T = any>(request: Request): Promise<T> {
  try {
    return await (<T>request.json());
  } catch {
    throw new Error("Invalid JSON body");
  }
}

const getRouter = () => Router.getInstance();

export { getRouter, Router, type RouteHandler };
