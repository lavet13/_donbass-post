import { Link } from "@tanstack/react-router";
import { Lock, LogIn } from "lucide-react";
import type { FC } from "react";
import { buttonVariants } from "./ui/button";

export const UnauthorizedErrorComponent: FC<{ pathname: string }> = ({
  pathname,
}) => {
  return (
    <main className="flex flex-col items-center justify-start grow shrink-0 my-1">
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center rounded-xl border border-border">
        <div className="bg-destructive-border rounded-full p-4 mb-6">
          <Lock size={32} className="text-destructive" />
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Доступ запрещен
        </h2>

        <p className="text-muted-foreground text-base mb-8 max-w-md leading-6">
          Для доступа к этому разделу необходимо войти в систему
        </p>

        <Link
          to={"/auth"}
          search={(prev) => ({ redirect: pathname, ...prev })}
          className={buttonVariants({})}
        >
          <LogIn size={18} />
          Войти в систему
        </Link>
      </div>
    </main>
  );
};
