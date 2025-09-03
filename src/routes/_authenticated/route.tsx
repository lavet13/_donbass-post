import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuGroup,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarModeToggle,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip } from "@/components/ui/tooltip";
import { TypographyH2 } from "@/components/ui/typography/typographyH2";
import { cn } from "@/lib/utils";
import {
  createFileRoute,
  Link,
  linkOptions,
  redirect,
} from "@tanstack/react-router";
import {
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  SquareArrowOutUpRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: () => (
    <SidebarProvider>
      <AuthenticatedLayout />
    </SidebarProvider>
  ),
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

function AuthenticatedLayout() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  const navItems = linkOptions([
    {
      label: "Мои заявки",
      to: "/dashboard/requests",
      Icon: FileText,
      items: linkOptions([{ label: "Главная", to: "/" }]),
    },
  ]);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex-1 shrink @max-[130px]:hidden">
          <TypographyH2
            className={cn(
              "text-accent-foreground sm:leading-none text-sm @max-[130px]:hidden",
            )}
          >
            Личный кабинет
          </TypographyH2>
        </div>
        <div className="grow-0 @max-[130px]:flex-1 @max-[130px]:px-[0.5rem]">
          <Tooltip
            side="right"
            content={!isCollapsed ? "Свернуть панель" : "Открыть панель"}
          >
            <Button
              className="ml-auto rounded-full @max-[130px]:w-full @min-[130px]:min-w-9 @min-[130px]:max-w-9 @max-[130px]:rounded-lg"
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
            >
              {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
          </Tooltip>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navItems.map(({ label, to, Icon, items }) => {
          return (
            <SidebarMenuGroup key={to}>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    leftElement={<Icon />}
                    content={label}
                    title={label}
                    variant="sidebar"
                    asChild
                  >
                    <Link
                      activeProps={{
                        className: cn(
                          "data-[status=active]:bg-primary data-[status=active]:text-primary-foreground",
                          "hover:data-[status=active]:bg-primary/95 active:data-[status=active]:bg-primary/90",
                        ),
                      }}
                      to={to}
                    >
                      {!isCollapsed && (
                        <span className={cn("truncate")}>{label}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>

                  {items.length > 0 && (
                    <SidebarMenuSub>
                      {items.map(({ label, to }) => (
                        <SidebarMenuSubItem key={to}>
                          <SidebarMenuButton
                            content={label}
                            title={label}
                            asChild
                          >
                            <Link
                              activeProps={{
                                className: cn(
                                  "data-[status=active]:bg-primary data-[status=active]:text-primary-foreground",
                                  "hover:data-[status=active]:bg-primary/95 active:data-[status=active]:bg-primary/90",
                                ),
                              }}
                              to={to}
                            >
                              {!isCollapsed && (
                                <span className={cn("truncate")}>{label}</span>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarMenuGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="icon"
            variant="ghost"
            content="Вернуться на сайт"
            asChild
          >
            <Link to="/">
              <SquareArrowOutUpRight />
              {!isCollapsed && (
                <span className={cn("truncate")}>Вернуться на сайт</span>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarModeToggle />
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}

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
