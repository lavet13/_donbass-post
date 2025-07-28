import { useRegistrationUserMutation } from "./mutations";
import { useAppForm } from "@/hooks/form";
import { defaultRegistrationUserOpts } from "./shared-form";
import { RegistrationUserForm } from "./nested-form";
import { Suspend } from "@/components/suspend";
import { isAxiosError } from "axios";

export default function RegistrationUserPage() {
  const { mutateAsync: registerUser } = useRegistrationUserMutation();

  const form = useAppForm({
    ...defaultRegistrationUserOpts,
    onSubmit: async ({ value, formApi }) => {
      const { phone, password } = value;
      try {
        await registerUser({ phone, password });
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
        }
      } finally {
        formApi.reset();
      }
    },
  });

  return (
    <Suspend>
      <RegistrationUserForm form={form} />
    </Suspend>
  );
}
