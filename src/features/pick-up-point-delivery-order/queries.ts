import { workplacePostApi } from "@/axios";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

type UsePickUpPointDeliveryOrderUserQueryProps = {
  options?: UseQueryOptions;
};

const pickUpPointDeliveryOrderKeys = createQueryKeys('pick-up-point-delivery-order', {
  user: {
    queryKey: null,
  },
});

const fetchPickUpPointDeliveryOrderUser = async () => {
  const response = await workplacePostApi.get('pick-up-point-delivery-order/user');

  return response.data;
};

const usePickUpPointDeliveryOrderUserQuery = (props: UsePickUpPointDeliveryOrderUserQueryProps = {}) => {
  const { options = {}} = props;

  return useQuery({
    queryKey: pickUpPointDeliveryOrderKeys.user.queryKey,
    queryFn: fetchPickUpPointDeliveryOrderUser,
    ...options,
  });
};

export { usePickUpPointDeliveryOrderUserQuery, pickUpPointDeliveryOrderKeys };
