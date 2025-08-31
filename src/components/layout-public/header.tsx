import { Link } from "@tanstack/react-router";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Tooltip } from "@/components/ui/tooltip";

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
    <header className="container max-w-6xl px-2 h-14 flex items-center">
      <div className="flex items-center gap-1">
        <Button variant="ghost" asChild>
          <Link to="/" activeOptions={{ exact: true }}>
            Главная
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/shop-cost-calculation-order">Заявка ИМ</Link>
        </Button>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <Tooltip content={content}>
          <ModeToggle />
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
