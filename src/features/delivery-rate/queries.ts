import { createQueryKeys } from "@lukemorales/query-key-factory";
import type {
  CalculateGlobalParams,
  CalculateGlobalResult,
  DeliveryRateKeys,
} from "@/features/delivery-rate/types";
import { workplacePostApi } from "@/axios";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

const deliveryRateKeys = createQueryKeys("delivery-rate", {
  calculateGlobal: (params: CalculateGlobalParams | undefined) => ({
    queryKey: [params],
    queryFn: () => fetchDeliveryCalculationResult(params),
  }),
});

const fetchDeliveryCalculationResult = async (
  params: CalculateGlobalParams | undefined,
) => {
  const response = await workplacePostApi.get<CalculateGlobalResult>(
    "delivery-rate/calculate-global",
    { params },
  );

  return response.data;
};

type UseCalculateGlobalQueryProps = {
  params?: CalculateGlobalParams;
  options?: Omit<
    UseQueryOptions<
      CalculateGlobalResult,
      AxiosError<{ message: string }>,
      CalculateGlobalResult,
      DeliveryRateKeys["calculateGlobal"]["queryKey"]
    >,
    "queryKey"
  >;
};

const useCalculateGlobalQuery = (props: UseCalculateGlobalQueryProps = {}) => {
  const { options, params } = props;
  return useQuery({
    ...deliveryRateKeys.calculateGlobal(params),
    retry: 0,
    ...options,
  });
};

export {
  deliveryRateKeys,
  fetchDeliveryCalculationResult,
  useCalculateGlobalQuery,
};
