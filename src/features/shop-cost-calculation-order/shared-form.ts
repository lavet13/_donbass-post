import type { AutoDimissMessageProps } from "@/components/auto-dismiss-message";
import { formOptions } from "@tanstack/react-form";

type FormMeta = {
  onSuccess: React.Dispatch<
    React.SetStateAction<AutoDimissMessageProps>
  > | null;
};

const defaultMeta: FormMeta = {
  onSuccess: null,
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
