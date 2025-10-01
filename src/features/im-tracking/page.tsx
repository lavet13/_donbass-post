import { useAppForm } from "@/hooks/form";
import type { FC } from "react";
import { IMTrackingForm } from "./nested-form";
import { defaultIMTrackingOpts } from "./shared-form";
import { useIMTrackingMutation } from "./mutation";

const IMTrackingPage: FC = () => {
  const { mutateAsync: getIMTracking } = useIMTrackingMutation();

  const form = useAppForm({
    ...defaultIMTrackingOpts,
    onSubmit: async ({ value, formApi }) => {
      const response = await getIMTracking({
        promo: value.promo,
      });
      console.log({ response });
      formApi.reset();
    },
  });

  return <IMTrackingForm form={form} />
};

export default IMTrackingPage;
