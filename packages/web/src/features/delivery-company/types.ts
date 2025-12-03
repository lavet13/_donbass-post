import type { inferQueryKeys } from "@lukemorales/query-key-factory";
import type { deliveryCompanyKeys } from "@/features/delivery-company/queries";

export type DeliveryCompanyKeys = inferQueryKeys<typeof deliveryCompanyKeys>;
export type DeliveryCompany = {
  id: number;
  name: string;
};
