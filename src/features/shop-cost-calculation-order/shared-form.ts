import { formOptions } from "@tanstack/react-form";

export const defaultShopCostCalculationOrderOpts = formOptions({
  defaultValues: {
    shopCostCalculationOrder: {
      name: "",
      surname: "",
      patronymic: "",
      phone: "",
      email: "",
      pointTo: "",
    },
    shop: [
      {
        name: "",
        products: [{ description: "", price: "", link: "" }],
      },
    ],
    accepted: false,
  },
});
