import type { inferQueryKeys } from "@lukemorales/query-key-factory";
import type { additionalService } from "@/features/additional-service/queries";

export type AdditionalServiceKeys = inferQueryKeys<typeof additionalService>;
export type AdditionalServicePickUp = {
  id: number;
  name: string;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
