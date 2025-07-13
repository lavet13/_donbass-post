import { useAppForm } from "@/hooks/form";
import { defaultShopCostCalculationOrderOpts } from "@/features/shop-cost-calculation-order/shared-form";
import { ShopCostCalculationOrderForm } from "@/features/shop-cost-calculation-order/nested-form";
import { sleep } from "@/lib/utils";
import { Suspense } from "react";
import { Loader } from "lucide-react";

export default function ShopCostCalculationOrderPage() {
  const form = useAppForm({
    ...defaultShopCostCalculationOrderOpts,
    onSubmit: async ({ value, formApi }) => {
      console.log({ value });
      await sleep(1500);
      formApi.reset();
    },
  });

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <Loader className="animate-spin size-5" />
        </div>
      }
    >
      <ShopCostCalculationOrderForm form={form} />
    </Suspense>
  );
}
