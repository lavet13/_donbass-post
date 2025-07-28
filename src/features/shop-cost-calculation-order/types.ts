export type ShopCostCalculationOrderVariables = {
  shopCostCalculationOrder: {
    name: string;
    surname: string;
    patronymic: string;
    phone: string;
    email: string;
    pointTo?: number;
  };
  shopCostCalculationOrderPosition: {
    shop: string;
    description: string;
    price: number;
    link: string;
  }[];
};
