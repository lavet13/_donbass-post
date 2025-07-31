import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Fragment } from "react/jsx-runtime";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedComponent,
  async beforeLoad() {},
});

function AuthenticatedComponent() {
  return (
    <Fragment>
      <h1>help me!</h1>
      <Outlet />
    </Fragment>
  );
}
