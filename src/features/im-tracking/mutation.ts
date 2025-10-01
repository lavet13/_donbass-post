import { workplacePostApi } from "@/axios";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { IMTrackingParams } from "./types";
import type { AxiosError } from "axios";

type UseIMTrackingMutationProps = {
  options?: UseMutationOptions<any, AxiosError<{ message: string }>, IMTrackingParams>;
};

const useIMTrackingMutation = (props: UseIMTrackingMutationProps = {}) => {
  const { options = {} } = props;

  return useMutation({
    async mutationFn(variables) {
      const response = await workplacePostApi.get('/im-tracking', {
        params: variables,
      });

      return response.data;
    },
    ...options,
  });
};

export { useIMTrackingMutation };
