import type { AutoDimissMessageProps } from "@/components/auto-dismiss-message";
import { formOptions } from "@tanstack/react-form";

type FormMeta = {
  onSubmit: React.Dispatch<
    React.SetStateAction<AutoDimissMessageProps>
  > | null;
};

const defaultMeta: FormMeta = {
  onSubmit: null,
};

export const defaultUserRegistrationOpts = formOptions({
  onSubmitMeta: defaultMeta,
  defaultValues: {
    phone: "",
    password: "",
    confirmPassword: "",
    accepted: true,
  },
});
