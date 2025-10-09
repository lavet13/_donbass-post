import type { inferQueryKeys } from "@lukemorales/query-key-factory";
import type { trackingRostovKeys } from "./queries";

export type TrackingRostovResult = {
  id: number;
  npTrack: string;
  otherTrack: string;
  status: string;
  date: string;
  dateTransfer: string;
  transferCompany: string;
  ttn: string;
  datePL: string;
  ttnPL: string;
  point: string;
  createdAt: string;
  updatedAt: string;
};

export type TrackingRostovParams = {
  trackingNumber: string;
};

export type TrackingRostovKeys = inferQueryKeys<typeof trackingRostovKeys>;
