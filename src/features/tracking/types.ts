export type TrackingRostovErrorResult = {
  success: false;
  error: string;
  message: string;
};

export type TrackingRostovSuccessResult = {
  success: true;
  data: TrackingRostovData;
};

export type TrackingRostovData = {
  id: number;
  npTrack: string;
  otherTrack: string;
  status: string;
  date: string;
  dataTransfer: string;
  transferCompany: string;
  ttn: string;
  datePL: string;
  ttnPL: string;
  point: string;
  createdAt: string;
  updatedAt: string;
};

export type TrackingRostovResult =
  | TrackingRostovErrorResult
  | TrackingRostovSuccessResult;

export type TrackingRostovParams = {
  trackingNumber: string;
};
