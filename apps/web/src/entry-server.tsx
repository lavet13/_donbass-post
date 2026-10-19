import { renderToString } from "react-dom/server";
import { Theme } from "@radix-ui/themes";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { createAppRouter } from "@/router";
import type { useAuth } from "@/hooks/use-auth";

/**
 * Public pages written to dist/<path>/index.html at build time, so crawlers and
 * slow first loads get real HTML. /auth and the dashboard stay client-only: they
 * are noindex, and nginx serves them the empty shell (dist/spa.html).
 */
export const PRERENDER_PATHS = [
  "/",
  "/tracking",
  "/schedules",
  "/pick-up-point-delivery-order",
  "/online-pickup-rf",
  "/shop-cost-calculation-order",
];

/** Nobody is logged in at build time; public routes never call these. */
const anonymous: ReturnType<typeof useAuth> = {
  user: null,
  isAuthenticated: false,
  isManager: false,
  setToken: () => {},
  login: async () => {},
  logout: async () => {},
};

/**
 * Renders one route to an HTML string in Node. appearance="inherit": the server
 * can't know the visitor's theme, so the markup follows the light/dark class that
 * the inline script in index.html puts on <html> before first paint.
 */
export async function render(path: string) {
  const router = createAppRouter({
    history: createMemoryHistory({ initialEntries: [path] }), // Node has no window.location
    isServer: true,
  });
  await router.load(); // resolve matches and lazy route chunks before rendering
  return renderToString(
    <Theme appearance="inherit" accentColor="red" grayColor="gray" panelBackground="solid">
      <RouterProvider router={router} context={{ auth: anonymous }} />
    </Theme>,
  );
}
