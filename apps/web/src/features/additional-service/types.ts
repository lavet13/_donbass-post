import type { inferQueryKeys } from "@lukemorales/query-key-factory";
import type { additionalServiceKeys } from "@/features/additional-service/queries";

export type AdditionalServiceKeys = inferQueryKeys<typeof additionalServiceKeys>;
export type AdditionalServicePickUp = {
  id: number;
  name: string;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
