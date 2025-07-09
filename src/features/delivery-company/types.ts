import type { inferQueryKeys } from "@lukemorales/query-key-factory";
import type { deliveryCompany } from "@/features/delivery-company/queries";

export type DeliveryCompanyKeys = inferQueryKeys<typeof deliveryCompany>;
export type DeliveryCompany = {
  id: number;
  name: string;
};
