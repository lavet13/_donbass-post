import { Link } from "@tanstack/react-router";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export const Header: FC = () => {
  return (
    <header className="container px-2 h-14 flex items-center">
      <Button asChild>
        <Link to="/" activeOptions={{ exact: true }}>
          Главная
        </Link>
      </Button>
      <Button asChild>
        <Link to="/auth">Авторизоваться</Link>
      </Button>
      <ModeToggle />
    </header>
  );
};
