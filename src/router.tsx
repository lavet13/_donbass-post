import { createRouter as reactRouter } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DefaultErrorComponent } from "@/components/default-error-component";
import { DefaultNotFoundComponent } from "@/components/default-not-found-component";
import { TooltipProvider } from "@radix-ui/react-tooltip";

function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000,
        retry: 2,
      },
    },
  });

  return reactRouter({
    context: {
      queryClient,
      auth: undefined!,
    },
    routeTree,
    scrollRestoration: true,
    notFoundMode: "fuzzy",
    defaultPreload: "intent",
    defaultErrorComponent: DefaultErrorComponent,
    defaultNotFoundComponent: DefaultNotFoundComponent,
    defaultPreloadStaleTime: 0, // @see (link: https://tanstack.com/router/latest/docs/framework/react/guide/preloading#preloading-with-external-libraries)
    basepath: "/user", // @see (link: https://tanstack.com/router/v1/docs/framework/react/api/router/RouterOptionsType#basepath-property)

    // Optionally, we can use `Wrap` to wrap our router in the loader client provider
    Wrap: ({ children }) => {
      return (
        <QueryClientProvider client={queryClient}>
          <TooltipProvider delayDuration={400}>{children}</TooltipProvider>
        </QueryClientProvider>
      );
    },
  });
}

export const router = createRouter();
