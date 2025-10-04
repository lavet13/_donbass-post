export type IMTrackingErrorResult = {
  success: false;
  message: string;
  error: string;
};
export type IMTrackingSuccessResult = {
  success: true;
  data: IMTrackingData;
};
export type IMTrackingData = {
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

export type IMTrackingResult = IMTrackingErrorResult | IMTrackingSuccessResult;

export type IMTrackingParams = {
  promo: string;
};
