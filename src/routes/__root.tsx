import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { QueryClient } from "@tanstack/react-query";
import type { useAuth } from "@/hooks/use-auth";
import { Fragment } from "react/jsx-runtime";
import { NProgress } from "@/components/nprogress";

type MyRouterContext = {
  queryClient: QueryClient;
  auth: ReturnType<typeof useAuth>;
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <Fragment>
      <HeadContent />
      <NProgress />
      <Outlet />
      <Scripts />
      <TanStackRouterDevtools position="bottom-right" initialIsOpen={false} />
      <ReactQueryDevtools initialIsOpen={false} />
    </Fragment>
  );
}
