import { workplacePostApi } from "@/axios";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery } from "@tanstack/react-query";

type CalculateGlobalParams = {
  weight: number;
  cubicMeter: number;
  pointFrom: number;
  pointTo: number;
  deliveryType: number;
  deliveryCompany: number;
  deliveryRateGroup: number;
  isHomeDelivery: boolean;
};

const deliveryRateKeys = createQueryKeys("delivery-rate", {
  "calculate-global": (params: CalculateGlobalParams) => [params],
});

const fetchDeliveryRate = async (params: CalculateGlobalParams) => {
  const response = await workplacePostApi.get(
    "delivery-rate/calculate-global",
    { params },
  );

  return response.data;
};

const useCalculateGlobalQuery = (params: CalculateGlobalParams) =>
  useQuery({
    queryKey: deliveryRateKeys["calculate-global"](params).queryKey,
    queryFn: () => fetchDeliveryRate(params),

    retry: false,
  });

export {
  deliveryRateKeys,
  useCalculateGlobalQuery,
  type CalculateGlobalParams,
};
