import type { FC } from "react";
import { PickUpPointDeliveryOrderForm } from "@/features/pick-up-point-delivery-order/nested-form";
import { useAppForm } from "@/hooks/form";
import { defaultPickUpPointDeliveryOrderOpts } from "@/features/pick-up-point-delivery-order/shared-form";
import { Suspend } from "@/components/suspend";
import { useAdditionalServicePickUpQuery } from "../additional-service/queries";

const PickUpPointDeliveryOrderPage: FC = () => {
  const {
    data: additionalServices,
  } = useAdditionalServicePickUpQuery();

  const form = useAppForm({
    ...defaultPickUpPointDeliveryOrderOpts,
    onSubmit: ({ value, formApi }) => {
      console.log({ value });
      formApi.reset();
      formApi.setFieldValue(
        "additionalService",
        additionalServices?.map((s) => ({ ...s, selected: "no" })) ?? [],
      );
    },
  });

  return (
    <Suspend>
      <PickUpPointDeliveryOrderForm form={form} />
    </Suspend>
  );
};

export default PickUpPointDeliveryOrderPage;
