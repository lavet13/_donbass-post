import { Footer } from "@/components/layout-public/footer";
import { Header } from "@/components/layout-public/header";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Fragment } from "react/jsx-runtime";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <Fragment>
      <div className="flex min-h-svh flex-col">
        <Header />
        <main className="flex flex-1 flex-col">
          <div className="container mx-auto flex min-h-[calc(100svh-var(--header-height))] w-full max-w-6xl flex-1 flex-col">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </Fragment>
  );
}
