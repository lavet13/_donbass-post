import { useAppForm } from "@/hooks/form";
import type { FC } from "react";
import { defaultCargoTrackingOpts } from "@/features/cargo-tracking/shared-form";
import { CargoTrackingForm } from "@/features/cargo-tracking/nested-form";
import { useCargoTrackingMutation } from "@/features/cargo-tracking/mutations";

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
