import { defaultOnSubmitInvalid } from "@/hooks/form";
import { formOptions } from "@tanstack/react-form";

export const defaultCargoTrackingOpts = formOptions({
  onSubmitInvalid: defaultOnSubmitInvalid,
  defaultValues: {
    trackingNumber: "",
  },
});
