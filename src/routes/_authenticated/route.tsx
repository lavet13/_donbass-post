import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import {
  createFileRoute,
  Link,
  linkOptions,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
  beforeLoad({ context, location }) {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/auth",
        search: {
          redirect: location.href,
        },
        replace: true,
      });
    }
  },
});

const navItems = linkOptions([
  { label: "Мои заявки", to: "/dashboard/requests", Icon: FileText },
]);

function AuthenticatedLayout() {
  const styles = getComputedStyle(document.documentElement);
  const smallBreakpoint = styles.getPropertyValue("--breakpoint-sm");

  const isMobile = useMediaQuery(`(max-width: ${smallBreakpoint})`);
  console.log({ isMobile });

  const collapsedSizePercent = isMobile ? 0 : 6;
  const expandedSizePercent = 15;

  return (
    <Fragment>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          collapsedSize={collapsedSizePercent}
          collapsible
          defaultSize={expandedSizePercent}
          maxSize={expandedSizePercent}
          minSize={collapsedSizePercent}
        >
          <div className="@container flex-1 flex flex-col h-full">
            <div className="flex gap-1 items-center"></div>
            <div className="pt-2 flex-1 flex flex-col">
              {navItems.map(({ label, to, Icon }) => (
                <Button
                  className="not-last:border-b border-sidebar-border"
                  key={to}
                  title={label}
                  variant="sidebar"
                  asChild
                >
                  <Link
                    activeProps={{
                      className: cn(
                        "data-[status=active]:bg-primary data-[status=active]:text-primary-foreground",
                        "data-[status=active]:hover:bg-primary/95 data-[status=active]:active:bg-primary/90",
                      ),
                    }}
                    to={to}
                  >
                    <Icon />
                    <span className="truncate @max-[150px]:hidden">
                      {label}
                    </span>
                  </Link>
                </Button>
              ))}
            </div>
            <div className="pb-2 flex justify-center">
              <ModeToggle className="w-full rounded-none" />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <main className="flex flex-col grow shrink-0 min-h-[100svh]">
            <div className="flex-1 flex flex-col items-center justify-center">
              <Outlet />
            </div>
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Fragment>
  );
}
