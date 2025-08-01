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
      <Header />
      <main className="flex flex-col grow shrink-0 min-h-[calc(100svh-3.5rem)]">
        <div className="flex-1 flex flex-col items-center justify-center">
          <Outlet />
        </div>
      </main>
      <Footer />
    </Fragment>
  );
}
