import { DefaultErrorComponent } from "@/components/default-error-component";
import { UnauthorizedErrorComponent } from "@/components/unauthorized-error-component";
import { pickUpPointDeliveryOrderUserQueryOptions } from "@/features/pick-up-point-delivery-order/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useLocation } from "@tanstack/react-router";
import { isAxiosError } from "axios";

export const Route = createFileRoute(
  "/_authenticated/dashboard/requests/pick-up-point-delivery-order",
)({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      pickUpPointDeliveryOrderUserQueryOptions,
    ),
  errorComponent({ error, reset }) {
    const pathname = useLocation({
      select: (location) => location.pathname,
    });

    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        return <UnauthorizedErrorComponent pathname={pathname} />;
      }
    }

    return <DefaultErrorComponent error={error} reset={reset} />;
  },
});

function RouteComponent() {
  const { data } = useSuspenseQuery(pickUpPointDeliveryOrderUserQueryOptions);

  console.log({ data });

  return <div></div>;
}
