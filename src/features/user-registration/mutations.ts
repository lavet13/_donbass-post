import { workplacePostApi } from "@/axios";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { UserRegistrationResult, UserRegistrationVariables } from "@/features/user-registration/types";

type UseUserRegistrationMutationProps = {
  options?: UseMutationOptions<UserRegistrationResult, Error, UserRegistrationVariables>;
};

export const useUserRegistrationMutation = (
  props: UseUserRegistrationMutationProps = {},
) => {
  const { options = {} } = props;

  return useMutation({
    async mutationFn(variables) {
      const response = await workplacePostApi.post(
        "auth/registration-user",
        variables,
      );

      return response.data;
    },
    ...options,
  });
};
