import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { QueryClient } from "@tanstack/react-query";
import type { useAuth } from "@/hooks/use-auth";
import NProgress from "nprogress";
import { Fragment } from "react/jsx-runtime";
import { useEffect, useRef } from "react";

type MyRouterContext = {
  queryClient: QueryClient;
  auth: ReturnType<typeof useAuth>;
};

// Progress bar animation for all pages
NProgress.configure({
  showSpinner: false, // Disable the spinner
  speed: 300, // Animation speed
  minimum: 0.1, // Start percentage
  trickleSpeed: 200, // How often to trickle progress
});

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const routerState = useRouterState({
    select: ({ status, location }) => ({ status, location }),
  });
  const prevPathname = useRef(routerState.location.pathname);
  const isPending = routerState.status === "pending";

  useEffect(() => {
    const pathnameChanged =
      prevPathname.current !== routerState.location.pathname;

    if (isPending && pathnameChanged) {
      NProgress.start();
    } else if (!isPending) {
      NProgress.done();
      prevPathname.current = routerState.location.pathname;
    }

    // Cleanup function to ensure progress is stopped if component unmounts
    return () => {
      NProgress.done();
    };
  }, [isPending, routerState.location.pathname]);

  return (
    <Fragment>
      <HeadContent />
      <Outlet />
      <Scripts />
      <TanStackRouterDevtools position="bottom-right" initialIsOpen={false} />
      <ReactQueryDevtools initialIsOpen={false} />
    </Fragment>
  );
}
