import { ShopCostCalculationOrderPage } from "@/routes/_public/shop-cost-calculation-order/-shared";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/shop-cost-calculation-order/")({
  component: ShopCostCalculationOrderComponent,
});

function ShopCostCalculationOrderComponent() {
  return <ShopCostCalculationOrderPage />;
}
