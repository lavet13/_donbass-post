import { workplacePostApi } from "@/axios";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { ShopCostCalculationOrder } from "@/features/shop-cost-calculation-order/types";

type UseShopCostCalculationOrderProps = {
  options?: UseMutationOptions<
    ShopCostCalculationOrder,
    Error,
    ShopCostCalculationOrder
  >;
};

export const useShopCostCalculationOrderMutation = (
  props: UseShopCostCalculationOrderProps = {},
) => {
  const { options = {} } = props;

  return useMutation({
    async mutationFn(variables: ShopCostCalculationOrder) {
      const response = await workplacePostApi.post<ShopCostCalculationOrder>(
        "shop-cost-calculation-order",
        variables,
      );
      console.log({ response });

      return response.data;
    },
    ...options,
  });
};
