import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: () => <Outlet />,
  beforeLoad({ location }) {
    const dashboardPath = new RegExp(`${Route.fullPath}/?$`);

    if (dashboardPath.test(location.pathname)) {
      throw redirect({
        to: "/dashboard/requests",
      });
    }
  },
});
