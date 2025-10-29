import { Footer } from "@/components/layout-public/footer";
import { Header } from "@/components/layout-public/header";
import { sidebarOpenAtom } from "@/components/ui/main-sidebar/atom";
import { mainSidebarAtom } from "@/components/ui/main-sidebar/atom";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { Fragment } from "react/jsx-runtime";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  const routerState = useRouterState({
    select: ({ resolvedLocation }) => ({
      resolvedLocation,
    }),
  });

  const isSchedulesPage =
    routerState.resolvedLocation?.pathname.includes("/schedules");

  const [mainSidebarWidth, setMainSidebarWidth] = useState(0);
  const [mainSidebar, setMainSidebar] = useAtom(mainSidebarAtom);
  const cookieSidebarState = useAtomValue(sidebarOpenAtom);
  const isSidebarOpen = cookieSidebarState === "open" ? true : false;

  const styles = getComputedStyle(document.documentElement);
  const middleBreakpoint = styles.getPropertyValue("--breakpoint-md");
  const isDesktop = useMediaQuery(
    `(min-width: calc(${middleBreakpoint} - 1px))`,
  );
  const largeBreakpoint = styles.getPropertyValue("--breakpoint-lg");
  const isBeyondDesktop = useMediaQuery(`(min-width: ${largeBreakpoint})`);

  useEffect(() => {
    if (!mainSidebar) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setMainSidebarWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(mainSidebar);

    return () => {
      resizeObserver.disconnect();
    };
  }, [mainSidebar]);

  return (
    <Fragment>
      <div className="flex min-h-svh flex-col">
        <Header />
        <main className="flex min-w-0 flex-1">
          {isSidebarOpen && (
            <div
              ref={(node) => setMainSidebar(node)}
              id="main-sidebar-desktop"
              className={cn(
                "sticky top-[calc(var(--header-height))]",
                "flex h-[calc(100dvh-var(--header-height))] flex-col pr-2",
                "bg-background/80 dark:bg-background/80 backdrop-blur-sm min-w-0",
              )}
              style={{
                flexGrow: 0,
                flexShrink: 0,
              }}
            />
          )}
          <div
            className="container mx-auto flex min-h-[calc(100dvh-var(--header-height))] w-full max-w-6xl min-w-0 flex-col"
            style={{
              flexGrow: 0,
              flexShrink: 1,
            }}
          >
            <Outlet />
          </div>
          {isSidebarOpen && mainSidebar && isDesktop && (
            <div
              style={{
                width: `${mainSidebarWidth}px`,
                flexGrow: 0,
                flexShrink: isSchedulesPage
                  ? 2.4
                  : isBeyondDesktop
                    ? 0
                    : isDesktop
                      ? 1
                      : undefined,
              }}
              className="sticky top-[calc(var(--header-height))] min-w-0 h-[calc(100dvh-var(--header-height))]"
            />
          )}
        </main>
        <Footer />
      </div>
    </Fragment>
  );
}
