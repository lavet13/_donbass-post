import { additionalServicePickUpQueryOptions } from "@/features/additional-service/queries";
import { deliveryCompaniesQueryOptions } from "@/features/delivery-company/queries";
import PickUpPointDeliveryOrderPage from "@/features/pick-up-point-delivery-order/page";
import { pointPostQueryOptions } from "@/features/point/queries";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/pick-up-point-delivery-order")({
  component: RouteComponent,
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(deliveryCompaniesQueryOptions),
      context.queryClient.ensureQueryData(pointPostQueryOptions),
      context.queryClient.ensureQueryData(additionalServicePickUpQueryOptions),
    ]),
});

function RouteComponent() {
  return <PickUpPointDeliveryOrderPage />;
}
