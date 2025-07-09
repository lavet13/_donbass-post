import type { inferQueryKeys } from "@lukemorales/query-key-factory";
import type { point } from "@/features/point/queries";

export type PointKeys = inferQueryKeys<typeof point>;

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
