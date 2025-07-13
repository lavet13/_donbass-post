import ShopCostCalculationOrderPage from "@/features/shop-cost-calculation-order/page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <ShopCostCalculationOrderPage />
    </div>
  );
}
