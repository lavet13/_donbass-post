import { Heading, IconButton, Tooltip } from "@radix-ui/themes";
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

  const collapsedButton = (
    <IconButton
      className="@max-[130px]:w-full [&_svg]:size-4"
      radius="full"
      variant="ghost"
      size="3"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
      }}
    >
      {isCollapsed && !isMobile ? <PanelLeftOpen /> : <PanelLeftClose />}
    </IconButton>
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex-1 min-w-0 shrink @max-[130px]:hidden">
          <Heading
            truncate
            wrap="nowrap"
            as="h2"
            size="2"
            className={
              "pl-3 leading-rx-4 mb-1 sm:mb-0 tracking-tight @max-[130px]:hidden"
            }
          >
            Личный кабинет
          </Heading>
        </div>
        <div className={cn("min-w-0 @max-[130px]:flex-1 mt-2 mx-2", isMobile && "mr-3")}>
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
            leftElement={<LogOut />}
            content="Выйти из аккаунта"
            onClick={() => logout({ redirect: pathname })}
          >
            {(!isCollapsed || isMobile) && (
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
