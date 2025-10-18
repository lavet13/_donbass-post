import type { AutoDismissMessageProps } from "@/components/ui/auto-dismiss-message";
import { formOptions } from "@tanstack/react-form";
import type { ReactNode } from "react";

type FormMeta = {
  setMessage?: React.Dispatch<React.SetStateAction<ReactNode>>;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setVariant?: React.Dispatch<
    React.SetStateAction<AutoDismissMessageProps["variant"]>
  >;
};

const defaultMeta: FormMeta = {};

export const defaultShopCostCalculationOrderOpts = formOptions({
  onSubmitMeta: defaultMeta,
  defaultValues: {
    shopCostCalculationOrder: {
      name: "",
      surname: "",
      patronymic: "",
      phone: "",
      email: "",
      pointTo: "",
    },
    shopCostCalculationOrderPosition: [
      {
        shop: "",
        products: [{ description: "", price: 0, link: "" }],
      },
    ],
    accepted: false,
  },
});
