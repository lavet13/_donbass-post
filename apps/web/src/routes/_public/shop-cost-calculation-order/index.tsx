import { ShopCostCalculationOrderPage } from "@/routes/_public/shop-cost-calculation-order/-shared";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_public/shop-cost-calculation-order/")({
  head: () =>
    pageHead({
      title: "Просчёт стоимости выкупа заказов",
      description: "Заявка на просчёт стоимости выкупа интернет-заказов с доставкой.",
    }),
  component: ShopCostCalculationOrderComponent,
});

function ShopCostCalculationOrderComponent() {
  return <ShopCostCalculationOrderPage />;
}
