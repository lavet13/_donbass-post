import type { FC } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@radix-ui/themes";
import { NOINDEX } from "@/lib/seo";

export const DefaultNotFoundComponent: FC = () => {
  return (
    <main className="flex flex-col grow shrink-0 min-h-[100svh]">
      {/* nginx answers every unknown URL with index.html and status 200; noindex
          keeps those "soft 404" pages out of search results. React 19 moves a
          <meta> into <head> wherever it is rendered. (No <title> here: the root
          route's default is already rendered, and a second one would duplicate it.) */}
      <meta {...NOINDEX} />
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-5xl lg:text-6xl font-bold">404</h1>
        <p className="text-center leading-7">
          Упс, такой страницы не существует
        </p>
        <Button asChild>
          <Link to="/">Вернуться на главную страницу</Link>
        </Button>
      </div>
    </main>
  );
};
