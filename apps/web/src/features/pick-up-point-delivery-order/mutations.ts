import { workplacePostApi } from "@/axios";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { PickUpPointDeliveryOrderVariables } from "@/features/pick-up-point-delivery-order/types";

type UsePickUpPointDeliveryOrderMutationProps = {
  // UseMutationOptions<result, error, variables passed to mutationFn>
  options?: UseMutationOptions<{}, Error, PickUpPointDeliveryOrderVariables>;
};

export const usePickUpPointDeliveryOrderMutation = (
  props: UsePickUpPointDeliveryOrderMutationProps = {},
) => {
  const { options = {} } = props;

  return useMutation({
    async mutationFn(variables) {
      const response = await workplacePostApi.post<{}>(
        "pick-up-point-delivery-order",
        variables,
      );

      return response.data;
    },
    ...options,
  });
};
