import { Link } from "@tanstack/react-router";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/use-auth";

export const Header: FC = () => {
  const { isAuthenticated, handleLogout } = useAuth();

  return (
    <header className="container px-2 h-14 flex items-center">
      <Button asChild>
        <Link to="/" activeOptions={{ exact: true }}>
          Главная
        </Link>
      </Button>
      {!isAuthenticated ? (
        <Button asChild>
          <Link to="/auth">Авторизоваться</Link>
        </Button>
      ) : (
        <Button onClick={handleLogout}>Выйти</Button>
      )}
      <ModeToggle />
    </header>
  );
};
