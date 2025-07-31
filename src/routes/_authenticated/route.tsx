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
  component: AuthenticatedComponent,
  beforeLoad({ context, location }) {
    if (!context.auth.isAuthenticated) {
      console.log("_authenticated before load fired");
      throw redirect({
        to: "/auth",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});

function AuthenticatedComponent() {
  const { isAuthenticated, handleLogout } = useAuth();

  return (
    <Fragment>
      {!isAuthenticated ? (
        <Button asChild>
          <Link to="/auth">Авторизоваться</Link>
        </Button>
      ) : (
        <Button onClick={handleLogout}>Выйти</Button>
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
