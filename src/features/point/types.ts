import type { inferQueryKeys } from "@lukemorales/query-key-factory";
import type { pointKeys } from "@/features/point/queries";

export type PointKeys = inferQueryKeys<typeof pointKeys>;

export type DeliveryPoint = {
  id: number;
  name: string;
  shortName: string | null;
  address: string;
  mobilePoint: boolean;
  workTime: string | null;
  city: {
    id: number;
  };
  deliveryCompany: {
    name: string;
  };
  fullName: string;
};
