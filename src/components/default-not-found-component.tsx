import type { FC } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const DefaultNotFoundComponent: FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <h1 className="text-5xl lg:text-6xl font-bold">404</h1>
      <p className="text-center leading-7">Упс, такой страницы не существует</p>
      <Button asChild>
        <Link to="/">Вернуться на главную страницу</Link>
      </Button>
    </div>
  );
};
