import { formOptions } from "@tanstack/react-form";

export const defaultUserLoginOpts = formOptions({
  defaultValues: {
    phone: '',
    password: '',
    accepted: true,
  },
});
