import { Link } from "@tanstack/react-router";
import type { FC } from "react";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";

export const Header: FC = () => {
  return (
    <header className="container px-2 h-14 flex items-center">
      <Button variant="secondary" asChild>
        <Link to="/">Главная</Link>
      </Button>
      <ModeToggle />
    </header>
  );
};
