export type TrackingRostovResult = {
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

export type TrackingRostovParams = {
  trackingNumber: string;
};
