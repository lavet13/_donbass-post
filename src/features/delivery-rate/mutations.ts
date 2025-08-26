import { workplacePostApi } from "@/axios";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { CalculateGlobalParams, CalculateGlobalResult } from "@/features/delivery-rate/types";

type UseCalculateGlobalMutationProps = {
  options?: UseMutationOptions<CalculateGlobalResult, Error, CalculateGlobalParams>;
};

const useCalculateGlobalMutation = (
  props: UseCalculateGlobalMutationProps = {},
) => {
  const { options = {} } = props;

  return useMutation({
    async mutationFn(variables) {
      const response = await workplacePostApi.get<CalculateGlobalResult>(
        "delivery-rate/calculate-global",
        { params: variables },
      );

      return response.data;
    },
    ...options,
  });
};

export { useCalculateGlobalMutation, type CalculateGlobalParams };
