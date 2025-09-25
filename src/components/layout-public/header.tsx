import { Link } from "@tanstack/react-router";
import type { ComponentProps, FC } from "react";
import { Button, Tooltip } from "@radix-ui/themes";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const NavButton: FC<
  ComponentProps<typeof Button> & ComponentProps<typeof Link>
> = ({ className, to, activeOptions, ...props }) => {
  return (
    <Button
      variant="ghost"
      radius="full"
      size="2"
      className={cn(
        "data-[status=active]:bg-accent-9 hover:data-[status=active]:bg-accent-10",
        "active:data-[status=active]:filter-(--base-button-solid-active-filter)",
        "data-[status=active]:text-accent-contrast data-[status=active]:font-medium",
        className,
      )}
      asChild
    >
      <Link {...props} to={to} />
    </Button>
  );
};

export const Header: FC = () => {
  const { isAuthenticated } = useAuth();
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
    <header className="sticky top-0 w-full h-14 z-1 flex bg-gray-2 dark:bg-grayA-2 dark:backdrop-blur-lg border-b border-grayA-6">
      <div className="container flex items-center w-full max-w-6xl pl-3.5">
        <div className="flex items-center gap-4.5">
          <NavButton to="/" activeOptions={{ exact: true }}>
            Главная
          </NavButton>
          <NavButton to="/shop-cost-calculation-order">
            Выкуп менеджером ИМ
          </NavButton>
          <NavButton to="/pick-up-point-delivery-order">Забор груза</NavButton>
          <NavButton to="/schedules">Расписание</NavButton>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <Tooltip content={content}>
            <ModeToggle />
          </Tooltip>
          {!isAuthenticated ? (
            <Button variant="classic" asChild>
              <Link to="/auth">Личный кабинет</Link>
            </Button>
          ) : (
            <Button variant="classic" asChild>
              <Link to="/dashboard">Мой кабинет</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

{
  /* <Button className="ml-auto" onClick={logout}>Выйти</Button> */
}
