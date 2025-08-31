import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tooltip } from "@/components/ui/tooltip";
import { TypographyH2 } from "@/components/ui/typography/typographyH2";
import { useContainerQuery } from "@/hooks/use-container-query";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import {
  createFileRoute,
  Link,
  linkOptions,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  SquareArrowOutUpRight,
} from "lucide-react";
import { useRef } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
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
  console.log({ isTabletMax });

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

  const collapsedSizePercent = isTabletMax ? 0 : isFullHDMin ? 2.5 : 7;
  const minimalSizePercent = collapsedSizePercent + 16;
  const maximumSizePercent = isTabletMax ? 16 : 23;
  const defaultSizePercent = isTabletMax ? 16 : 23;

  const panelRef = useRef<ImperativePanelHandle>(null);
  const { ref, isMatched } = useContainerQuery<HTMLDivElement>(
    "min-width: 1px and max-width: 130px",
  );

  return (
    <Fragment>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          ref={panelRef}
          className="bg-sidebar"
          collapsedSize={collapsedSizePercent}
          collapsible
          defaultSize={defaultSizePercent}
          maxSize={maximumSizePercent}
          minSize={minimalSizePercent}
        >
          <div
            ref={ref}
            className="h-full @container flex flex-col overflow-y-auto min-h-screen"
          >
            {/* Sticky header */}
            <div className="sticky top-0 z-10 @max-[130px]:text-center flex @max-[130px]:justify-center justify-between gap-1 items-center mt-1 pl-1 lg:pl-3 pr-0.5 @max-[130px]:px-0">
              <div className="flex-1 shrink @max-[130px]:hidden">
                <TypographyH2 className="text-accent-foreground sm:leading-none text-sm @max-[130px]:hidden">
                  Личный кабинет
                </TypographyH2>
              </div>
              <div className="grow-0 @max-[130px]:flex-1">
                <Tooltip
                  side="right"
                  content={
                    panelRef.current?.isExpanded()
                      ? "Свернуть панель"
                      : "Открыть панель"
                  }
                >
                  <Button
                    className="ml-auto rounded-full @max-[130px]:w-full @min-[130px]:min-w-9 @min-[130px]:max-w-9 @max-[130px]:rounded-none"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (panelRef.current) {
                        if (panelRef.current.isCollapsed()) {
                          panelRef.current.expand();
                        } else {
                          panelRef.current.collapse();
                        }
                      }
                    }}
                  >
                    {panelRef.current?.isCollapsed() ? (
                      <ArrowRight />
                    ) : (
                      <ArrowLeft />
                    )}
                  </Button>
                </Tooltip>
              </div>
            </div>

            {/* Navigation */}
            {/* @TODO: making subnav items  */}
            <div className="pt-2 flex-1 flex flex-col min-h-0">
              {navItems.map(({ label, to, Icon }) => {
                const renderLink = () => (
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
                      <span className={cn("truncate", isMatched && "hidden")}>
                        {label}
                      </span>
                    </Link>
                  </Button>
                );

                if (isMatched) {
                  return (
                    <Tooltip key={to} side="right" content={label}>
                      {renderLink()}
                    </Tooltip>
                  );
                }

                return renderLink();
              })}
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 z-10 pb-2 flex flex-col justify-center">
              {(() => {
                const { theme } = useTheme();

                let content = "";
                const isDark = window.matchMedia(
                  "(prefers-color-scheme: dark)",
                ).matches;
                if (theme === "dark") {
                  content = "Изменить на светлую тему";
                } else if (theme === "light") {
                  content = "Изменить на темную тему";
                } else {
                  content = isDark
                    ? "Изменить на светлую тему"
                    : "Изменить на темную тему";
                }

                if (isMatched) {
                  return (
                    <>
                      <Tooltip side="right" content="Вернуться на сайт">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-full rounded-none px-1"
                          asChild
                        >
                          <Link to="/">
                            <SquareArrowOutUpRight />
                            <span
                              className={cn("truncate", isMatched && "hidden")}
                            >
                              Вернуться на сайт
                            </span>
                          </Link>
                        </Button>
                      </Tooltip>
                      <Tooltip side="right" content={content}>
                        <ModeToggle className="px-1 w-full rounded-none" />
                      </Tooltip>
                    </>
                  );
                }

                return (
                  <>
                    <Button
                      title="Вернуться на сайт"
                      size="icon"
                      variant="ghost"
                      className="w-full rounded-none px-1"
                      asChild
                    >
                      <Link to="/">
                        <SquareArrowOutUpRight />
                        <span className={cn("truncate", isMatched && "hidden")}>
                          Вернуться на сайт
                        </span>
                      </Link>
                    </Button>
                    <ModeToggle title={content} className="px-1 w-full rounded-none">
                      {content}
                    </ModeToggle>
                  </>
                );
              })()}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel>
          <main className="h-full flex flex-col grow shrink-0 overflow-y-auto">
            <div className="flex-1 flex flex-col max-h-screen overflow-y-auto">
              {panelRef.current?.isCollapsed() && isTabletMax && (
                <div className="container sticky top-0.5 mt-1">
                  <Tooltip
                    side="right"
                    content={
                      panelRef.current?.isExpanded()
                        ? "Свернуть панель"
                        : "Открыть панель"
                    }
                  >
                    <Button
                      className="text-accent-foreground rounded-full"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (panelRef.current) {
                          if (panelRef.current.isCollapsed()) {
                            panelRef.current.expand();
                          } else {
                            panelRef.current.collapse();
                          }
                        }
                      }}
                    >
                      {panelRef.current?.isCollapsed() ? (
                        <ArrowRight />
                      ) : (
                        <ArrowLeft />
                      )}
                    </Button>
                  </Tooltip>
                </div>
              )}

              <div className="container">
                <Outlet />
              </div>
            </div>
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Fragment>
  );
}
