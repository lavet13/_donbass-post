export type RouteHandler = (
  request: Request,
  params: Params,
) => Response | Promise<Response>;
type FinalHandler = (request: Request) => Response | Promise<Response>;
export type Middleware = (
  request: Request,
  next: () => Promise<Response>,
) => Promise<Response>;
export type Params = Record<string, string>;
export interface Route {
  handler: RouteHandler;
  middlewares: Middleware[];
}

export interface CompiledPath {
  regex: RegExp; // anchored matcher for the WHOLE pathname
  keys: string[]; // param names, in capture-group order
}

/**
 * Compiles a route path with ":name" segments into an anchored RegExp plus the
 * param names, e.g. "/api/track/:track" → { regex: /^\/api\/track\/([^/]+)$/, keys: ["track"] }.
 * Anchored at both ends, so it matches the WHOLE pathname, and a param can never
 * span a "/". Values are captured still URL-encoded; decoding is the caller's job.
 */
export function compilePath(path: string): CompiledPath {
  // "/api/track/:track" → ["", "api", "track", ":track"]
  // The leading "" turns back into the leading "/" when we join.
  const segments = path.split("/");
  const keys: string[] = []; // param names, in the same order as capture groups
  const wholePath: string[] = []; // regex source, one piece per segment

  for (const s of segments) {
    if (!s.startsWith(":")) {
      // Literal: escape it so "." or "(" match themselves, not regex meaning
      wholePath.push(escapeRegExp(s));
    } else {
      // Param: drop the ":" for the key name. ([^/]+) = one or more non-slash
      // chars, wrapped in ( ) so regex.exec returns it as a capture group
      keys.push(s.slice(1));
      wholePath.push("([^/]+)");
    }
  }

  // "/" needs no escaping in new RegExp(string); only /literal/ syntax needs \/
  const joined = wholePath.join("/");
  // ^ = start, $ = end: without them a longer path would still match inside
  const regex = new RegExp("^" + joined + "$");

  return { keys, regex };
}

/** Escapes RegExp metacharacters so a literal path segment matches only itself. */
function escapeRegExp(s: string): string {
  // /[...]/   a character class: matches ONE of the listed characters
  //   . * + ? ^ $ { } ( ) |   the metacharacters
  //   [ \]                    "[" and an escaped "]" (a bare "]" would close the class)
  //   \\                      a literal backslash
  // g         replace every match, not only the first
  // "\\$&"    replacement: a backslash, then $& = "the whole matched text"
  //           so "." becomes "\." and "(" becomes "\("
  // "-" is deliberately absent: it's not special outside [...] (see last turn)
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createRouter() {
  const routes = new Map<string, Map<string, Route>>();

  // PERF: param routes are matched by a linear scan: every request that misses the
  // static Map runs regex.exec against each param route in turn → O(n) in the number
  // of param routes. Fine at a handful. If this grows to dozens, switch to a prefix
  // tree (trie) keyed by path segment, so a lookup costs the number of segments in
  // the URL, not the number of routes (the approach routers like find-my-way use).
  const paramRoutes = new Map<
    string,
    Array<CompiledPath & { path: string; route: Route }>
  >();
  const globalMiddlewares: Middleware[] = [];

  /**
   * Finds the first param route for this method whose regex matches the pathname,
   * and decodes the captured values into a params object.
   * A malformed %-sequence becomes a synthetic route that answers 400. It's
   * returned as a route rather than a bare Response so global middlewares
   * (cors!) still run on it; otherwise the browser would report a CORS error
   * instead of the 400.
   */
  function matchParamRoute(
    method: string,
    pathname: string,
  ): { route: Route; params: Params } | null {
    // ?? [] = no param routes for this method → loop over nothing
    for (const { regex, keys, route } of paramRoutes.get(method) ?? []) {
      const match = regex.exec(pathname);
      if (!match) continue; // not this route, try the next one

      try {
        const params: Params = {};
        // match[0] is the whole path; the first param is match[1], hence i + 1
        keys.forEach((key, i) => {
          params[key] = decodeURIComponent(match[i + 1]!);
        });
        return { route, params };
      } catch (err) {
        // Re-throw anything that isn't bad %-encoding: a real bug should stay a 500
        if (!(err instanceof URIError)) throw err;
        return {
          route: {
            handler: () => error("Malformed URL encoding", { status: 400 }),
            middlewares: [],
          },
          params: {},
        };
      }
    }
    return null; // no param route matched → handle() falls through to 404
  }

  /**
   * Execute middleware chain
   * This is the "recursive next()" pattern
   */
  async function executeMiddlewares(
    request: Request,
    middlewares: Middleware[],
    handler: FinalHandler,
  ): Promise<Response> {
    let index = 0;

    const next = async (): Promise<Response> => {
      try {
        // If we still have middlewares to execute
        if (index < middlewares.length) {
          const middleware = middlewares[index++]!;
          // Call middleware with request and next function
          // The middleware can call next() to continue the chain
          // hand it the SAME next → it decides whether to go one layer deeper
          return await middleware(request, next);
        }

        // NO more middlewares, execute the final handler
        // no layers left: run the route
        return await handler(request);
      } catch (err) {
        // The INNERMOST next() that sees the throw turns it into a Response.
        // Its caller (e.g. cors, waiting on `await next()`) then receives an
        // ordinary 500 and decorates it on the way out like any other response.
        console.error("Route handler error:", err);
        return internalError(err);
      }
    };

    return await next(); // start at layer 0
  }

  function add(
    method: string,
    path: string,
    handler: RouteHandler,
    middlewares: Middleware[] = [],
  ) {
    const route = { handler, middlewares };

    // "/:" = some segment starts with ":" -> a param route like ".../search/:query"
    if (path.includes("/:")) {
      if (!paramRoutes.has(method)) paramRoutes.set(method, []);
      paramRoutes.get(method)!.push({ ...compilePath(path), route, path });

      return router;
    }

    // static routes keep their O(1) exact lookup
    if (!routes.has(method)) {
      routes.set(method, new Map());
    }
    routes.get(method)!.set(path, route);

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

      // Static first (more specific), then param routes
      const staticRoute = routes.get(method)?.get(path);
      const matched = staticRoute
        ? { route: staticRoute, params: {} }
        : matchParamRoute(method, path);
      const route = matched?.route;

      const handler: FinalHandler = matched
        ? (req) => matched.route.handler(req, matched.params)
        : () =>
            new Response(JSON.stringify({ error: "Not Found", path, method }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });

      const middlewares = route
        ? [...globalMiddlewares, ...route.middlewares]
        : [...globalMiddlewares]; // 404 still runs global mw (cors!)

      try {
        return await executeMiddlewares(request, middlewares, handler);
      } catch (error) {
        console.error("Route handler error:", error);
        return internalError(error);
      }
    },

    getRoutes(): Array<{ method: string; path: string }> {
      const allRoutes: Array<{ method: string; path: string }> = [];

      routes.forEach((paths, method) => {
        paths.forEach((_, path) => {
          allRoutes.push({ method, path });
        });
      });

      paramRoutes.forEach((entries, method) => {
        entries.forEach(({ path }) => {
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

/**
 * Builds the 500 response for an unexpected throw. Used inside the middleware
 * chain (so cors still decorates it) and as handle()'s last-resort backstop.
 */
export function internalError(err: unknown): Response {
  return Response.json(
    {
      error: "Internal Server Error",
      message: err instanceof Error ? err.message : "Unknown error",
    },
    { status: 500 },
  );
}

export async function parseJSON<T = any>(request: Request): Promise<T> {
  try {
    return await (<T>request.json());
  } catch {
    throw new Error("Invalid JSON body");
  }
}
