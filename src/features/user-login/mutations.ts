import { workplacePostApi } from "@/axios";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { UserLoginVariables } from "./types";

type UseUserLoginMutationProps = {
  options?: UseMutationOptions<{}, Error, UserLoginVariables>;
};

export const useUserLoginMutation = (props: UseUserLoginMutationProps = {}) => {
  const { options = {} } = props;

  return useMutation({
    async mutationFn(variables) {
      const response = await workplacePostApi.post(
        "auth/user",
        variables,
      );

      return response.data;
    },
    ...options,
  });
};
