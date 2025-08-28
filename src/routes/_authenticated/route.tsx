import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
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
  return (
    <Fragment>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          collapsedSize={5}
          collapsible
          defaultSize={15}
          maxSize={20}
          minSize={15}
        >
          <div className="flex flex-col">
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <main className="flex flex-col grow shrink-0 min-h-[100svh]">
            <div className="flex-1 flex flex-col items-center justify-center">
              <Outlet />
            </div>
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Fragment>
  );
}
