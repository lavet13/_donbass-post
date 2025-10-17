import { Link, linkOptions } from "@tanstack/react-router";
import { type FC } from "react";
import { Tooltip } from "@radix-ui/themes";
import { useTheme } from "@/hooks/use-theme";
import { Calendar, HandbagIcon, Package } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import MainNav from "@/components/ui/main-nav";
import {
  MainSidebar,
  MainSidebarButton,
  MainSidebarContent,
  MainSidebarFooter,
  MainSidebarHeader,
} from "@/components/ui/main-sidebar";

export const Header: FC = () => {
  const navItems = [
    {
      label: "Грузы и посылки",
      triggerStyles: "py-2.5 px-4.5",
      icon: <Package />,
      items: linkOptions([
        {
          label: "Адресный забор/доставка груза в ЛДНР и Запорожье",
          to: "/pick-up-point-delivery-order",
        },
      ]),
    },
    {
      label: "Интернет заказы",
      triggerStyles: "py-2.5 px-4.5",
      icon: <HandbagIcon />,
      items: linkOptions([
        {
          label: "Оформление заявки на просчет стоимости на выкуп заказов",
          to: "/shop-cost-calculation-order",
        },
      ]),
    },
  ];

  return (
    <header className="bg-background dark:bg-grayA-2 sticky top-0 z-10 flex h-14 w-full dark:backdrop-blur-lg">
      <div className="flex w-full items-center px-3.5">
        <div className="relative flex h-full w-full items-center justify-between">
          <div className="flex flex-none items-center gap-3">
            <MainSidebar>
              <MainSidebarHeader />
              <MainSidebarContent>
                <MainSidebarButton Icon={Calendar} asChild>
                  <Link to="/schedules">Расписание</Link>
                </MainSidebarButton>
              </MainSidebarContent>
              <MainSidebarFooter />
            </MainSidebar>
          </div>
          <div className="absolute top-1/2 left-1/2 flex flex-1 shrink-0 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <MainNav navItems={navItems} />
          </div>
          <div className="flex flex-none items-center justify-end">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

const ThemeToggle: FC = () => {
  let content = "";
  const { theme } = useTheme();
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (theme === "dark") {
    content = "Изменить на светлую тему";
  } else if (theme === "light") {
    content = "Изменить на темную тему";
  } else {
    content = isDark ? "Изменить на светлую тему" : "Изменить на темную тему";
  }

  return (
    <Tooltip content={content}>
      <ModeToggle size="3" />
    </Tooltip>
  );
};
