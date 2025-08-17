import type { AutoDimissMessageProps } from "@/components/auto-dismiss-message";
import { formOptions } from "@tanstack/react-form";

type FormMeta = {
  onSubmit: React.Dispatch<
    React.SetStateAction<AutoDimissMessageProps>
  > | null;
};

const defaultMeta: FormMeta = {
  onSubmit: null,
};

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
