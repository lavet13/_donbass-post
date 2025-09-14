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
      <div className="flex flex-col min-h-svh">
        <Header />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col container w-full max-w-6xl mx-auto min-h-[calc(100svh-3.5rem)]">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </Fragment>
  );
}
