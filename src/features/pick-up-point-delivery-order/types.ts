/* This is what we sending to the endpoint /api/pick-up-point-delivery-order */
export type PickUpPointDeliveryOrderVariables = {
  sender?: IndividualSender;
  companySender?: CompanySender;
  recipient?: IndividualRecipient;
  companyRecipient?: CompanyRecipient;
  customer?: IndividualCustomer;
  companyCustomer?: CompanyCustomer;
  cargoData: {
    shippingPayment: string;
    description: string;
    weightHeaviestPosition: number;
    totalWeight: number;
    declaredPrice: number;
    cubicMeter: number;
    cashOnDelivery?: number;
  };
  additionalService?: { id: number }[];
};

type IndividualSender = {
  nameSender: string;
  surnameSender: string;
  patronymicSender: string;
  phoneSender: string;
  telegramSender: boolean;
  whatsAppSender: boolean;
  pointFrom: number;
  pickupAddress: string;
  emailSender: string;
};

type CompanySender = {
  companySender: string;
  phoneSender: string;
  emailSender: string;
  pointFrom: number;
  pickupAddress: string;
  innSender: string;
};

type IndividualRecipient = {
  nameRecipient: string;
  surnameRecipient: string;
  patronymicRecipient: string;
  phoneRecipient: string;
  telegramRecipient: boolean;
  whatsAppRecipient: boolean;
  deliveryCompany: number;
  deliveryAddress: string;
};

type CompanyRecipient = {
  companyRecipient: string;
  phoneRecipient: string;
  emailRecipient: string;
  deliveryAddress: string;
  innRecipient: string;
  deliveryCompany: number;
};

type IndividualCustomer = {
  nameCustomer: string;
  surnameCustomer: string;
  patronymicCustomer: string;
  phoneCustomer: string;
  telegramCustomer: boolean;
  whatsAppCustomer: boolean;
};

type CompanyCustomer = {
  companyCustomer: string;
  phoneCustomer: string;
  emailCustomer: string;
  innCustomer: string;
};

export type {
  IndividualSender,
  IndividualRecipient,
  IndividualCustomer,
  CompanySender,
  CompanyRecipient,
  CompanyCustomer,
};
