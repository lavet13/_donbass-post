import { workplacePostApi } from "@/axios";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { ShopCostCalculationOrder } from "@/features/shop-cost-calculation-order/types";

type UseShopCostCalculationOrderProps = {
  // UseMutationOptions<result, error, variables passed to mutationFn>
  options?: UseMutationOptions<{}, Error, ShopCostCalculationOrder>;
};

export const useShopCostCalculationOrderMutation = (
  props: UseShopCostCalculationOrderProps = {},
) => {
  const { options = {} } = props;

  return useMutation({
    async mutationFn(variables) {
      const response = await workplacePostApi.post<{}>(
        "shop-cost-calculation-order",
        variables,
      );
      console.log({ response });

      return response.data;
    },
    ...options,
  });
};
