import { workplacePostApi } from "@/axios";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

type UseShopCostCalculationOrderUserQueryProps = {
  options?: UseQueryOptions;
};

const shopCostCalculationOrderKeys = createQueryKeys(
  "shop-cost-calculation-order",
  {
    user: {
      queryKey: null,
    },
  },
);

const fetchShopCostCalculationOrderUser = async () => {
  const response = await workplacePostApi.get("shop-cost-calculation-order/user");

  return response.data;
};

const useShopCostCalculationOrderUserQuery = (
  props: UseShopCostCalculationOrderUserQueryProps = {},
) => {
  const { options = {} } = props;

  return useQuery({
    queryKey: shopCostCalculationOrderKeys.user.queryKey,
    queryFn: fetchShopCostCalculationOrderUser,
    ...options,
  });
};

export { useShopCostCalculationOrderUserQuery, shopCostCalculationOrderKeys };
