import { useAppForm } from "@/hooks/form";
import type { FC } from "react";
import { defaultUserLoginOpts } from "./shared-form";
import { UserLoginForm } from "./nested-form";
import { useUserLoginMutation } from "./mutations";
import { isAxiosError } from "axios";
import { useAtomValue, useSetAtom } from "jotai";
import { authTokenAtom, isJWTExpiredAtom, userPayloadAtom } from "@/atoms";

const UserLoginPage: FC = () => {
  const { mutateAsync: loginUser } = useUserLoginMutation();
  const setAuthToken = useSetAtom(authTokenAtom);
  const isExpired = useAtomValue(isJWTExpiredAtom);
  const user = useAtomValue(userPayloadAtom);
  console.log({ isExpired, user });

  const form = useAppForm({
    ...defaultUserLoginOpts,
    onSubmit: async ({ value, formApi }) => {
      try {
        const { phone, password } = value;
        const { token } = await loginUser({ phone, password });
        setAuthToken(token);
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
