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
      console.log({ value });
      try {
        await registerUser({});
      } catch (error) {
        if (isAxiosError(error)) {
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
