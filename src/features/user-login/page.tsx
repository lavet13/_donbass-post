import { useAppForm } from "@/hooks/form";
import type { FC } from "react";
import { defaultUserLoginOpts } from "./shared-form";
import { UserLoginForm } from "./nested-form";
import { useUserLoginMutation } from "./mutations";
import { isAxiosError } from "axios";

const UserLoginPage: FC = () => {
  const { mutateAsync: loginUser } = useUserLoginMutation();

  const form = useAppForm({
    ...defaultUserLoginOpts,
    onSubmit: async ({ value, formApi }) => {
      try {
        const { phone, password } = value;
        await loginUser({ phone, password });
        formApi.reset();
      } catch (error) {
        if (isAxiosError(error)) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx

            const status = error.response.status;

            if (status === 404) {
              // User not found
            }

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

  return <UserLoginForm form={form} />;
};

export default UserLoginPage;
