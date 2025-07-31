import * as React from "react";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { QueryClient } from "@tanstack/react-query";
import type { useAuth } from "@/hooks/use-auth";

type MyRouterContext = {
  queryClient: QueryClient;
  auth: ReturnType<typeof useAuth>;
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <HeadContent />

      <Header />
      <main className="flex flex-col grow shrink-0 min-h-[calc(100svh-3.5rem)]">
        <div className="flex-1 flex flex-col items-center justify-center">
          <Outlet />
        </div>
      </main>
      <Footer />

      <Scripts />
      <TanStackRouterDevtools initialIsOpen={false} />
      <ReactQueryDevtools initialIsOpen={false} />
    </React.Fragment>
  );
}
