import { workplacePostApi } from "@/axios";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import {
  queryOptions,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";

type UsePickUpPointDeliveryOrderUserQueryProps = {
  options?: UseQueryOptions;
};

const pickUpPointDeliveryOrderKeys = createQueryKeys(
  "pick-up-point-delivery-order",
  {
    user: {
      queryKey: null,
    },
  },
);

const fetchPickUpPointDeliveryOrderUser = async () => {
  const response = await workplacePostApi.get(
    "pick-up-point-delivery-order/user",
  );

  return response.data;
};

const pickUpPointDeliveryOrderUserQueryOptions = queryOptions({
  queryKey: pickUpPointDeliveryOrderKeys.user.queryKey,
  queryFn: fetchPickUpPointDeliveryOrderUser,
});

const usePickUpPointDeliveryOrderUserQuery = (
  props: UsePickUpPointDeliveryOrderUserQueryProps = {},
) => {
  const { options = {} } = props;

  return useQuery({
    ...pickUpPointDeliveryOrderUserQueryOptions,
    ...options,
  });
};

export {
  usePickUpPointDeliveryOrderUserQuery,
  pickUpPointDeliveryOrderKeys,
  pickUpPointDeliveryOrderUserQueryOptions,
};
