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
  SidebarMenuLink,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarModeToggle,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip } from "@/components/ui/tooltip";
import { TypographyH2 } from "@/components/ui/typography/typographyH2";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  createFileRoute,
  linkOptions,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import {
  FileText,
  LogOut,
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
  const { toggleSidebar, isCollapsed, isMobile } = useSidebar();
  const { logout } = useAuth();
  const pathname = useLocation({ select: ({ pathname }) => pathname });

  const navItems = linkOptions([
    {
      label: "Мои заявки",
      to: "/dashboard/requests",
      activeOptions: { exact: true },
      Icon: FileText,
      items: linkOptions([
        {
          label: "Заявка ИМ",
          to: "/dashboard/requests/shop-cost-calculation-order",
        },
        {
          label: "Забор груза",
          to: "/dashboard/requests/pick-up-point-delivery-order",
        },
      ]),
    },
  ]);

  let collapsedButton = (
    <Button
      className="text-foreground ml-auto rounded-full @max-[130px]:w-full @min-[130px]:min-w-9 @min-[130px]:max-w-9 @max-[130px]:rounded-lg"
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
      }}
    >
      {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
    </Button>
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex-1 shrink @max-[130px]:hidden">
          <TypographyH2
            className={cn(
              "text-foreground sm:leading-none text-sm @max-[130px]:hidden",
            )}
          >
            Личный кабинет
          </TypographyH2>
        </div>
        <div className="grow-0 @max-[130px]:flex-1 @max-[130px]:px-[0.5rem]">
          {isMobile ? (
            collapsedButton
          ) : (
            <Tooltip
              side="right"
              content={!isCollapsed ? "Свернуть панель" : "Открыть панель"}
            >
              {collapsedButton}
            </Tooltip>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navItems.map(({ label, to, activeOptions, Icon, items }) => {
          return (
            <SidebarMenuGroup key={to}>
              <SidebarMenu>
                <SidebarMenuItem label={label}>
                  <SidebarMenuLink
                    activeOptions={activeOptions}
                    to={to}
                    leftElement={<Icon />}
                    content={label}
                    title={label}
                  >
                    {label}
                  </SidebarMenuLink>

                  {items.length > 0 && (
                    <SidebarMenuSub>
                      {items.map(({ label, to }) => (
                        <SidebarMenuSubItem key={to}>
                          <SidebarMenuLink
                            to={to}
                            content={label}
                            title={label}
                          >
                            {label}
                          </SidebarMenuLink>
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
          <SidebarMenuLink
            leftElement={<SquareArrowOutUpRight />}
            to="/"
            content="Вернуться на сайт"
          >
            Вернуться на сайт
          </SidebarMenuLink>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarModeToggle />
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            content="Выйти из аккаунта"
            onClick={() => logout({ redirect: pathname })}
          >
            <LogOut />
            {!isCollapsed && (
              <span className="truncate">Выйти из аккаунта</span>
            )}
          </SidebarMenuButton>
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
