import { formOptions } from "@tanstack/react-form";

export const defaultRegistrationUserOpts = formOptions({
  defaultValues: {
    phone: "",
    password: "",
    confirmPassword: "",
    accepted: true,
  },
});
