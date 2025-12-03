import { workplacePostApi } from "@/axios";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { ShopCostCalculationOrderVariables } from "@/features/shop-cost-calculation-order/types";

type UseShopCostCalculationOrderProps = {
  // UseMutationOptions<result, error, variables passed to mutationFn>
  options?: UseMutationOptions<{}, Error, ShopCostCalculationOrderVariables>;
};

export const useShopCostCalculationOrderMutation = (
  props: UseShopCostCalculationOrderProps = {},
) => {
  const { options = {} } = props;

  return useMutation({
    async mutationFn(variables) {
      try {
        const response = await workplacePostApi.post<{}>(
          "shop-cost-calculation-order",
          variables,
        );

        return response.data;
      } catch (error) {
        return {};
      }
    },
    ...options,
  });
};
