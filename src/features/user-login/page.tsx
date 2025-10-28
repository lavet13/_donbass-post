import { useAppForm } from "@/hooks/form";
import { type FC } from "react";
import { defaultUserLoginOpts } from "./shared-form";
import { UserLoginForm } from "./nested-form";
import { useUserLoginMutation } from "./mutations";
import { isAxiosError } from "axios";
import { useAuth } from "@/hooks/use-auth";
import { useSearch } from "@tanstack/react-router";
import { Suspend } from "@/components/suspend";

const UserLoginPage: FC = () => {
  const search = useSearch({ from: "/_public/auth" });
  const { mutateAsync: loginUser } = useUserLoginMutation();

  const { login } = useAuth();

  const form = useAppForm({
    ...defaultUserLoginOpts,
    onSubmit: async ({ value, formApi, meta }) => {
      try {
        const { phone, password } = value;
        const { token } = await loginUser({ phone, password });
        await login(token, search);
        formApi.reset();
      } catch (error) {
        if (isAxiosError(error)) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx

            const status = error.response.status;
            const errorMessage = error.response.data.message as string;

            if (status === 401) {
              // Invalid password
              formApi.setErrorMap({
                onChange: {
                  fields: {
                    password: errorMessage,
                  },
                },
              });
            }

            if (status === 404) {
              // User not found
              meta.setOpen?.(true);
              meta.setMessage?.([errorMessage]);
              meta.setVariant?.("error");
            }

            if (status >= 500) {
              console.error("Server is out");
              meta.setOpen?.(true);
              meta.setMessage?.(["Сервер не отвечает. Попробуйте позже."]);
              meta.setVariant?.("error");
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
      <UserLoginForm form={form} />
    </Suspend>
  );
};

export default UserLoginPage;
