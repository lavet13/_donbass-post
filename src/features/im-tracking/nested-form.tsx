import { withForm } from "@/hooks/form";
import { defaultIMTrackingOpts } from "./shared-form";

export const IMTrackingForm = withForm({
  ...defaultIMTrackingOpts,
});
