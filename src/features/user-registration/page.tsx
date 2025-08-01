import { useUserRegistrationMutation } from "@/features/user-registration/mutations";
import { useAppForm } from "@/hooks/form";
import { defaultUserRegistrationOpts } from "@/features/user-registration/shared-form";
import { UserRegistrationForm } from "@/features/user-registration/nested-form";
import { Suspend } from "@/components/suspend";
import { isAxiosError } from "axios";
import type { FC } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSearch } from "@tanstack/react-router";

const UserRegistrationPage: FC = () => {
  const search = useSearch({ from: "/_public/auth" });
  const { mutateAsync: registerUser } = useUserRegistrationMutation();

  const { login } = useAuth();

  const form = useAppForm({
    ...defaultUserRegistrationOpts,
    onSubmit: async ({ value, formApi }) => {
      const { phone, password } = value;
      try {
        const { token } = await registerUser({ phone, password });
        await login(token, search);
        formApi.reset();
      } catch (error) {
        if (isAxiosError(error)) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx

            const status = error.response.status;

            if (status >= 500) {
              console.error("Server is out");
            }
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            import.meta.env.DEV && console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            import.meta.env.DEV && console.log("Error", error.message);
          }
        } else {
          import.meta.env.DEV && console.error("Unknown error");
        }
      }
    },
  });

  return (
    <Suspend>
      <UserRegistrationForm form={form} />
    </Suspend>
  );
};

export default UserRegistrationPage;
