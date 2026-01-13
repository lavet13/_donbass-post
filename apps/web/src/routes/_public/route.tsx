import { Footer } from "@/components/layout-public/footer";
import { Header } from "@/components/layout-public/header";
import {
  sidebarOpenAtom,
  mainSidebarAtom,
} from "@donbass-post/ui/main-sidebar/atom";
import { useMediaQuery } from "@donbass-post/ui/hooks";
import { cn } from "@donbass-post/ui/utils";
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
            <>
              {/* Placeholder to maintain space in the flow */}
              <div
                style={{
                  width: `${mainSidebarWidth}px`,
                  flexGrow: 0,
                  flexShrink: 0,
                }}
                className="min-w-0"
              />
              {/* Fixed sidebar */}
              <div
                ref={(node) => setMainSidebar(node)}
                id="main-sidebar-desktop"
                className={cn(
                  "fixed top-[calc(var(--header-height))]",
                  "flex h-[calc(100dvh-var(--header-height))] flex-col",
                  "bg-background/80 dark:bg-background/80 min-w-0 backdrop-blur-sm",
                )}
                style={{
                  flexGrow: 0,
                  flexShrink: 0,
                }}
              />
            </>
          )}
          <div
            className="xs:px-4 container mx-auto flex min-h-[calc(100dvh-var(--header-height))] w-full max-w-7xl min-w-0 flex-col px-3"
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
                flexShrink: isSchedulesPage ? 4.5 : 0,
              }}
              className="min-w-0"
            />
          )}
        </main>
        <Footer />
      </div>
    </Fragment>
  );
}
