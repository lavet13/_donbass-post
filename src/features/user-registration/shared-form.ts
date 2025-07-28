import { formOptions } from "@tanstack/react-form";

export const defaultUserRegistrationOpts = formOptions({
  defaultValues: {
    phone: "",
    password: "",
    confirmPassword: "",
    accepted: true,
  },
});
