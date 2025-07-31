import { Link } from "@tanstack/react-router";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/use-auth";

export const Header: FC = () => {
  const { isAuthenticated, handleLogout } = useAuth();

  return (
    <header className="container px-2 h-14 flex items-center">
      <div className="flex items-center gap-1">
        <Button asChild>
          <Link to="/" activeOptions={{ exact: true }}>
            Главная
          </Link>
        </Button>
        <Button asChild>
          <Link to="/shop-cost-calculation-order">Заявка ИМ</Link>
        </Button>
        <ModeToggle />
      </div>
      {!isAuthenticated ? (
        <Button className="ml-auto" asChild>
          <Link to="/auth">Авторизоваться</Link>
        </Button>
      ) : (
        <Button className="ml-auto" onClick={handleLogout}>Выйти</Button>
      )}
    </header>
  );
};
