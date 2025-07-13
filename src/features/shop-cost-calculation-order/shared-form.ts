import { formOptions } from "@tanstack/react-form";

export const defaultShopCostCalculationOrderOpts = formOptions({
  defaultValues: {
    shopCostCalculationOrder: {
      name: "",
      surname: "",
      patronymic: "",
      phone: "",
      email: "",
      pointTo: undefined,
    },
    shop: [
      {
        name: "",
        products: [{ description: "", price: 0, link: "" }],
      },
    ],
    accepted: false,
  },
});
