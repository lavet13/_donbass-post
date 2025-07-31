import ShopCostCalculationOrderPage from "@/features/shop-cost-calculation-order/page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/shop-cost-calculation-order")({
  component: ShopCostCalculationOrderComponent,
});

function ShopCostCalculationOrderComponent() {
  return <ShopCostCalculationOrderPage />;
}
