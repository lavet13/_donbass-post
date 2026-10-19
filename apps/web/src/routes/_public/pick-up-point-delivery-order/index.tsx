import { PickUpPointDeliveryOrderPage } from "@/routes/_public/pick-up-point-delivery-order/-shared";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_public/pick-up-point-delivery-order/")({
  head: () =>
    pageHead({
      title: "Заявка на забор груза в ЛДНР и Запорожье",
      description: "Онлайн-заявка на адресный забор и доставку груза в ЛДНР и Запорожье.",
    }),
  component: PickUpPointDeliveryOrderComponent,
});

function PickUpPointDeliveryOrderComponent() {
  return <PickUpPointDeliveryOrderPage />;
}
