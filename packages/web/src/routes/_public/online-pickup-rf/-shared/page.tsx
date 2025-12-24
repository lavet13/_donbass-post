import { useAppForm } from "@/hooks/form";
import type { FC } from "react";
import { defaultOnlinePickupRFOpts } from "./shared-form";
import { Suspend } from "@/components/suspend";
import { OnlinePickupRFForm } from "./nested-form";

const OnlinePickupRFPage: FC = () => {
  const form = useAppForm({
    ...defaultOnlinePickupRFOpts,
    onSubmit: async ({ value, formApi }) => {
      try {
        console.log({ value });
        formApi.reset();
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <Suspend>
      <div className="mx-auto w-full max-w-4xl">
        <OnlinePickupRFForm form={form} />
      </div>
    </Suspend>
  );
};

export default OnlinePickupRFPage;
