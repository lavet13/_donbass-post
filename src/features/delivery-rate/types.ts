import type { inferQueryKeys } from "@lukemorales/query-key-factory";
import type { deliveryRateKeys } from "@/features/delivery-rate/queries";

export type CalculateGlobalParams = {
  weight: number;
  cubicMeter: number;
  pointFrom: number;
  pointTo: number;
  deliveryType: number;
  deliveryCompany: number;
  deliveryRateGroup: number;
  isHomeDelivery: boolean;
};
export type CalculateGlobalResult = {
  price: number;
};
export type DeliveryRateKeys = inferQueryKeys<typeof deliveryRateKeys>;
