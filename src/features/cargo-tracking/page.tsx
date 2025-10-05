import { useAppForm } from "@/hooks/form";
import type { FC } from "react";
import { defaultCargoTrackingOpts } from "@/features/cargo-tracking/shared-form";
import { CargoTrackingForm } from "@/features/cargo-tracking/nested-form";
import { useCargoTrackingMutation } from "@/features/cargo-tracking/mutations";

const CargoTrackingPage: FC = () => {
  const { mutateAsync: getCargoTrackingData, data } =
    useCargoTrackingMutation();

  const form = useAppForm({
    ...defaultCargoTrackingOpts,
    onSubmit: async ({ formApi, value }) => {
      try {
        await getCargoTrackingData({
          trackingNumber: value.trackingNumber,
        });

        formApi.reset();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Произошла ошибка";

        formApi.setErrorMap({
          onChange: {
            fields: {
              trackingNumber: errorMessage,
            },
          },
        });
      }
    },
  });

  console.log({ data });

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-3">
      <CargoTrackingForm form={form} />
      {data ? <div className="flex-1 min-w-0 flex flex-col"></div> : null}
    </div>
  );
};

export default CargoTrackingPage;
