import { defaultOnSubmitInvalid } from "@donbass-post/forms/utils";
import { formOptions } from "@tanstack/react-form";

export const defaultCargoTrackingOpts = formOptions({
  onSubmitInvalid: defaultOnSubmitInvalid,
  defaultValues: {
    trackingNumber: "",
  },
});
