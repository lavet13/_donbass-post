import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { Fragment } from "react/jsx-runtime";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
  beforeLoad({ context, location }) {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/auth",
        search: {
          redirect: location.href,
        },
        replace: true,
      });
    }
  },
});

function AuthenticatedLayout() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <Fragment>
      {!isAuthenticated ? (
        <Button asChild>
          <Link to="/auth">Авторизоваться</Link>
        </Button>
      ) : (
        <Button onClick={logout}>Выйти</Button>
      )}
      <ModeToggle />
      <main className="flex flex-col grow shrink-0 min-h-[calc(100svh-3.5rem)]">
        <div className="flex-1 flex flex-col items-center justify-center">
          <Outlet />
        </div>
      </main>
    </Fragment>
  );
}
