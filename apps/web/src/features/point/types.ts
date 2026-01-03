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

export type DeliveryPointSchedule = {
  id: string | number;
  name: string;
  shortName: string | null;
  address: string;
  active: boolean;
  apiActive: boolean;
  mobilePoint: boolean;
  mondayWorkTime: string | null;
  tuesdayWorkTime: string | null;
  wednesdayWorkTime: string | null;
  thursdayWorkTime: string | null;
  fridayWorkTime: string | null;
  saturdayWorkTime: string | null;
  sundayWorkTime: string | null;
  image: string;
  map: string;
  temporarilyClosed: boolean;
  message: string;
  city: { id: number; name: string };
  deliveryCompany: { name: string };
};
