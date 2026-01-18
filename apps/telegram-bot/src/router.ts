type RouteHandler = (request: Request) => Response | Promise<Response>;

interface RouterType {
  add(method: string, path: string, handler: RouteHandler): void;
  get(path: string, handler: RouteHandler): void;
  post(path: string, handler: RouteHandler): void;
  handle(request: Request): Promise<Response>;
}

// class Route {
//   constructor(
//     public readonly method: string,
//     public readonly path: string,
//     public readonly handler: RouteHandler,
//     public readonly description?: string,
//   ) {}
// }

class Router implements RouterType {
  private readonly routes: Map<string, Map<string, RouteHandler>>;

  constructor() {
    this.routes = new Map();
  }

  add(method: string, path: string, handler: RouteHandler): this {
    if (!this.routes.has(method)) {
      this.routes.set(method, new Map());
    }
    this.routes.get(method)!.set(path, handler);

    return this;
  }

  get(path: string, handler: RouteHandler): this {
    return this.add("GET", path, handler);
  }

  post(path: string, handler: RouteHandler): this {
    return this.add("POST", path, handler);
  }

  async handle(request: Request): Promise<Response> {
    if (process.env.NODE_ENV === "development") {
      console.warn({ request });
    }

    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    const methodRoutes = this.routes.get(method);
    if (!methodRoutes) {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const handler = methodRoutes.get(path);
    if (!handler) {
      return new Response("Not Found", { status: 404 });
    }

    try {
      return await handler(request);
    } catch (error) {
      console.error("Route handler error:", error);
      return new Response("Internal Server Error:", { status: 500 });
    }
  }
}

const router = new Router();

export { router, Router, type RouterType, type RouteHandler };
