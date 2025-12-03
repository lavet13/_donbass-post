import type { inferQueryKeys } from "@lukemorales/query-key-factory";
import type { shopCostCalculationOrderKeys } from "./queries";

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
export type ShopCostCalculationOrderKeys = inferQueryKeys<typeof shopCostCalculationOrderKeys>;
