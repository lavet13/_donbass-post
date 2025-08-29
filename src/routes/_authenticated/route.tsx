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
  const middleBreakpoint = styles.getPropertyValue("--breakpoint-md");
  const _2xlBreakpoint = styles.getPropertyValue("--breakpoint-2xl");

  const isTabletMax = useMediaQuery(`(max-width: ${middleBreakpoint})`);
  const isFullHDMin = useMediaQuery(`(min-width: ${_2xlBreakpoint})`);

  // @TODO: add persistence! link: https://github.com/bvaughn/react-resizable-panels/blob/main/packages/react-resizable-panels-website/src/routes/examples/ExternalPersistence.tsx
  /*
    const sidebarStorageItem = localStorage.getItem(
      "react-resizable-panels:sidebar",
    );

    if (sidebarStorageItem) {
      const sidebarPersister = JSON.parse(sidebarStorageItem);

      const sidebarValues = Object.keys(sidebarPersister).map((sidebarValue) => {
        sidebarValue = sidebarValue.replace(/[{}]/g, "");
        const matchedValues = sidebarValue.match(/(.+?):(.+?)(?=,)/g)!;
        const result = [];

        for (const matchedValue of matchedValues) {
          const key = matchedValue.match(/\"(.*?)\"/)![1];
          let value = matchedValue.match(/\:(.*)/)![1];

          // @ts-ignore
          if (!isNaN(value)) {
            // @ts-ignore
            value = Number.parseFloat(value);
          } else if (value.includes("true")) {
            // @ts-ignore
            value = true;
          } else if (value.includes("false")) {
            // @ts-ignore
            value = false;
          }

          result.push([key, value]);
        }

        return Object.fromEntries(result);
      });

      console.log({ sidebarValues });
    }
  */

  const collapsedSizePercent = isTabletMax ? 0 : isFullHDMin ? 3 : 6;
  const minimalSizePercent = collapsedSizePercent + 6;
  const maximumSizePercent = 15 + (isTabletMax ? 4 : 0);
  const defaultSizePercent = isTabletMax ? 15 : 12;

  return (
    <Fragment>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          className="bg-sidebar"
          collapsedSize={collapsedSizePercent}
          collapsible
          defaultSize={defaultSizePercent}
          maxSize={maximumSizePercent}
          minSize={minimalSizePercent}
        >
          <div className="@container flex-1 flex flex-col h-full">
            <div className="flex gap-1 items-center"></div>
            <div className="pt-2 flex-1 flex flex-col">
              {navItems.map(({ label, to, Icon }) => (
                <Button
                  className="not-last:border-b border-primary/40"
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
