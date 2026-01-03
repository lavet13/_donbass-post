export type CargoTrackingParams = {
  trackingNumber: string;
};

export type CargoTrackingResult = {
  success: false;
  data: {
    waybillNumber: string;
    trackNumber: string;
    receptionDate: string; // Format: DD.MM.YYYY
    departureCity: string;
    destinationCity: string;
    departureDate: string;
    message: string;
    warehouseMovements: WarehouseMovement[];
    deliveryRecord: DeliveryRecord;
  };
};

type DeliveryRecord = {
  arrivalDate: string;
  deliveryDate: string;
};

export type WarehouseMovement = {
  arrivalDate: string; // Format: DD.MM.YYYY
  departureDate: string;
  warehousePoint: string;
};
