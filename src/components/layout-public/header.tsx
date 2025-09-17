import { Link } from "@tanstack/react-router";
import type { ComponentProps, FC } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const NavButton: FC<
  ComponentProps<typeof Button> & ComponentProps<typeof Link>
> = ({ className, to, activeOptions, ...props }) => {
  return (
    <Button
      className={cn(
        "data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground data-[status=active]:font-medium",
        "bg-background text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground",
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
    <header className="container sticky top-0 w-full max-w-6xl h-14 flex items-center z-20 bg-background/90 backdrop-blur-sm">
      <div className="flex items-center gap-1">
        <NavButton to="/" activeOptions={{ exact: true }}>
          Главная
        </NavButton>
        <NavButton to="/shop-cost-calculation-order">
          Выкуп менеджером ИМ
        </NavButton>
        <NavButton to="/pick-up-point-delivery-order">Забор груза</NavButton>
        <NavButton to="/schedules">Расписание</NavButton>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <Tooltip content={content}>
          <ModeToggle className="dark:text-accent-foreground" />
        </Tooltip>
        {!isAuthenticated ? (
          <Button asChild>
            <Link to="/auth">Личный кабинет</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link to="/dashboard">Мой кабинет</Link>
          </Button>
        )}
      </div>
    </header>
  );
};

{
  /* <Button className="ml-auto" onClick={logout}>Выйти</Button> */
}
