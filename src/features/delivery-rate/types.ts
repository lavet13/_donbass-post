import type { inferQueryKeys } from "@lukemorales/query-key-factory";
import type { deliveryRateKeys } from "@/features/delivery-rate/queries";

export type DeliveryRateKeys = inferQueryKeys<typeof deliveryRateKeys>;
