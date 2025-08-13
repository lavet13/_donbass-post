/* This is what we sending to the endpoint /api/pick-up-point-delivery-order */
export type PickUpPointDeliveryOrderVariables = {
  sender: {
    nameSender?: string;
    surnameSender?: string;
    patronymicSender?: string;
    telegramSender?: boolean;
    whatsAppSender?: boolean;
    innSender?: string;
    companySender?: string;
    emailSender: string;
    phoneSender: string;
    pickupAddress: string;
    pointFrom: number;
  };
  recipient: {
    nameRecipient?: string;
    surnameRecipient?: string;
    patronymicRecipient?: string;
    telegramRecipient?: boolean;
    whatsAppRecipient?: boolean;
    phoneRecipient: string;
    deliveryAddress: string;
    innRecipient?: string;
    companyRecipient?: string;
    emailRecipient?: string;
    deliveryCompany?: number;
  };
  customer: {
    nameCustomer?: string;
    surnameCustomer?: string;
    patronymicCustomer?: string;
    telegramCustomer?: boolean;
    whatsAppCustomer?: boolean;
    phoneCustomer: string;
    innCustomer?: string;
    companyCustomer?: string;
    emailCustomer?: string;
  };
  cargoData: {
    shippingPayment: string;
    description: string;
    weightHeaviestPosition: number;
    totalWeight: number;
    declaredPrice: number;
    cubicMeter: number;
    cashOnDelivery?: number;
  };
  additionalService?: { id: string }[];
};
