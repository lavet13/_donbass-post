import { Link } from "@tanstack/react-router";
import { Lock, LogIn } from "lucide-react";
import type { FC } from "react";
import { Button } from "@radix-ui/themes";

export const UnauthorizedErrorComponent: FC<{ pathname: string }> = ({
  pathname,
}) => {
  return (
    <main className="my-1 flex shrink-0 grow flex-col items-center justify-start">
      <div className="border-border flex min-h-[300px] flex-col items-center justify-center rounded-xl border p-8 text-center">
        <div className="bg-destructive-border mb-6 rounded-full p-4">
          <Lock size={32} className="text-destructive" />
        </div>

        <h2 className="text-foreground mb-2 text-2xl font-semibold">
          Доступ запрещен
        </h2>

        <p className="text-muted-foreground mb-8 max-w-md leading-6">
          Для доступа к этому разделу необходимо войти в систему
        </p>

        <Button variant="surface" size="2" asChild>
          <Link to="/auth" search={(prev) => ({ redirect: pathname, ...prev })}>
            <LogIn size={18} />
            Войти в систему
          </Link>
        </Button>
      </div>
    </main>
  );
};
