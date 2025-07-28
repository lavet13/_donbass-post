import { workplacePostApi } from "@/axios";
import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

type UseRegistrationUserMutationProps = {
  options?: UseMutationOptions<{}, Error, {}>;
};

export const useRegistrationUserMutation = (
  props: UseRegistrationUserMutationProps = {},
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
