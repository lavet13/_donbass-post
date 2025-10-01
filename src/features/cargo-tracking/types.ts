export type CargoTrackingParams = {
  trackingNumber: string;
};

export type CargoTrackingErrorResult = {
  success: false;
  error: string;
  message: string;
};

export type CargoTrackingSuccessResult = {
  success: true;
  data: CargoTrackingData;
};

export type CargoTrackingData = {
  waybillNumber: string;
  trackNumber: string;
  receptionDate: string; // Format: DD.MM.YYYY
  departureCity: string;
  destinationCity: string;
  departureDate: string;
  message: string;
  warehouseMovements: WarehouseMovement[];
};

export type WarehouseMovement = {
  arrivalDate: string; // Format: DD.MM.YYYY
  departureDate: string;
  warehousePoint: string;
};

export type CargoTrackingResult =
  | CargoTrackingSuccessResult
  | CargoTrackingErrorResult;
