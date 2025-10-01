import { useAppForm } from "@/hooks/form";
import type { FC } from "react";
import { defaultCargoTrackingOpts } from "./shared-form";
import { CargoTrackingForm } from "./nested-form";
import { useCargoTrackingMutation } from "./mutations";

const CargoTrackingPage: FC = () => {
  const { mutateAsync: getCargoTrackingData } = useCargoTrackingMutation();

  const form = useAppForm({
    ...defaultCargoTrackingOpts,
    onSubmit: async ({ formApi, value }) => {
      const response = await getCargoTrackingData({
        trackingNumber: value.trackingNumber,
      });

      if (response.success) {
        formApi.reset();
      } else {
        console.log({ response });
      }
    },
  });

  return <CargoTrackingForm form={form} />;
};

export default CargoTrackingPage;
