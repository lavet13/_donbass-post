import { Footer } from "@/components/layout-public/footer";
import { Header } from "@/components/layout-public/header";
import { sidebarOpenAtom } from "@/components/ui/main-sidebar/atom";
import { mainSidebarAtom } from "@/components/ui/main-sidebar/atom";
import { cn } from "@/lib/utils";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { Fragment } from "react/jsx-runtime";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  const setMainSidebar = useSetAtom(mainSidebarAtom);
  const cookieSidebarState = useAtomValue(sidebarOpenAtom);
  const isSidebarOpen = cookieSidebarState === "open" ? true : false;

  return (
    <Fragment>
      <div className="flex min-h-svh flex-col">
        <Header />
        <main className="flex flex-1">
          {isSidebarOpen && (
            <div
              ref={(node) => setMainSidebar(node)}
              id="main-sidebar-desktop"
              className={cn(
                "sticky top-[calc(var(--header-height))]",
                "flex h-[calc(100dvh-var(--header-height))] flex-col pr-2",
                "bg-background/80 dark:bg-background/80 backdrop-blur-sm",
              )}
            />
          )}
          <div className="container mx-auto flex min-h-[calc(100dvh-var(--header-height))] w-full max-w-6xl flex-1 flex-col">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </Fragment>
  );
}
