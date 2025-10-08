import type { inferQueryKeys } from "@lukemorales/query-key-factory";
import type { internetMagazineTrackingKeys } from "./queries";

export type IMTrackingResult = {
  id: number;
  promo: string;
  price: string;
  date: string;
  networkPay: string;
  track: string;
  calculatedStatus: string;
  createdAt: string;
  updatedAt: string;
};
export type InternetMagazineTrackingKeys = inferQueryKeys<
  typeof internetMagazineTrackingKeys
>;
