import { formOptions } from "@tanstack/react-form";

export const defaultPickUpPointDeliveryOrderOpts = formOptions({
  defaultValues: {
    sender: {
      type: "" as "individual" | "company",
      surnameSender: "",
      nameSender: "",
      patronymicSender: "",
      phoneSender: "",
      telegramSender: false,
      whatsAppSender: false,
      innSender: "",
      companySender: "",
      emailSender: "",
      pickupAddress: "",
      pointFrom: "",
    },

    recipient: {
      type: "" as "individual" | "company",
      nameRecipient: "",
      surnameRecipient: "",
      patronymicRecipient: "",
      telegramRecipient: false,
      whatsAppRecipient: false,
      phoneRecipient: "",
      deliveryAddress: "",
      innRecipient: "",
      companyRecipient: "",
      emailRecipient: "",
      deliveryCompany: "",
    },

    customer: {
      isToggled: false,
      type: "" as "individual" | "company",
      nameCustomer: "",
      surnameCustomer: "",
      patronymicCustomer: "",
      telegramCustomer: false,
      whatsAppCustomer: false,
      phoneCustomer: "",
      innCustomer: "",
      companyCustomer: "",
      emailCustomer: "",
    },

    cargoData: {
      shippingPayment: "",
      description: "",
      weightHeaviestPosition: 0,
      totalWeight: 0,
      declaredPrice: 0,
      cubicMeter: 0,
      cashOnDelivery: 0,

      // additional fields for calculating cubicMeter
      long: 0,
      width: 0,
      height: 0,
    },

    additionalService: [
      {
        label: "",
        value: 0,
      },
    ],

    accepted: false,
  },
});
