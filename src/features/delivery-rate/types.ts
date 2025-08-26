export type CalculateGlobalParams = {
  weight: number;
  cubicMeter: number;
  pointFrom: number;
  pointTo: number;
  deliveryType: number;
  deliveryCompany: number;
  deliveryRateGroup: number;
  isHomeDelivery: boolean;
};
export type CalculateGlobalResult = {
  price: number;
};
