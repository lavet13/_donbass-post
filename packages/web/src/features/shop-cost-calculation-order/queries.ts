import { workplacePostApi } from "@/axios";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import {
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";

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
  const response = await workplacePostApi.get(
    "shop-cost-calculation-order/user",
  );

  return response.data;
};

const shopCostCalculationOrderUserQueryOptions = queryOptions({
  queryKey: shopCostCalculationOrderKeys.user.queryKey,
  queryFn: fetchShopCostCalculationOrderUser,
});

const useShopCostCalculationOrderUserQuery = (
  props: UseShopCostCalculationOrderUserQueryProps = {},
) => {
  const { options = {} } = props;

  return useQuery({
    ...shopCostCalculationOrderUserQueryOptions,
    ...options,
  });
};

export {
  useShopCostCalculationOrderUserQuery,
  shopCostCalculationOrderKeys,
  shopCostCalculationOrderUserQueryOptions,
};
