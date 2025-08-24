import { Link } from "@tanstack/react-router";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/use-auth";

export const Header: FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="container max-w-7xl px-2 h-14 flex items-center">
      <div className="flex items-center gap-1">
        <Button variant="ghost" asChild>
          <Link to="/" activeOptions={{ exact: true }}>
            Главная
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/shop-cost-calculation-order">Заявка ИМ</Link>
        </Button>
        <ModeToggle />
      </div>
      {!isAuthenticated ? (
        <Button className="ml-auto" asChild>
          <Link to="/auth">Личный кабинет</Link>
        </Button>
      ) : (
        <Button className="ml-auto" onClick={logout}>Выйти</Button>
      )}
    </header>
  );
};
