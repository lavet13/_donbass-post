import PickUpPointDeliveryOrderPage from "@/features/pick-up-point-delivery-order/page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/pick-up-point-delivery-order")({
  component: PickUpPointDeliveryOrderComponent,
});

function PickUpPointDeliveryOrderComponent() {
  return <PickUpPointDeliveryOrderPage />;
}
