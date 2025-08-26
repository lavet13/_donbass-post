import type { AutoDimissMessageProps } from "@/components/auto-dismiss-message";
import { formOptions } from "@tanstack/react-form";

type FormMeta = {
  onSubmit: React.Dispatch<React.SetStateAction<AutoDimissMessageProps>> | null;
};

const defaultMeta: FormMeta = {
  onSubmit: null,
};

export const defaultPickUpPointDeliveryOrderOpts = formOptions({
  onSubmitMeta: defaultMeta,
  defaultValues: {
    sender: {
      type: "" as "individual" | "company" | "",
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
      type: "" as "individual" | "company" | "",
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
      pointTo: "",
    },

    customer: {
      isToggled: false,
      type: "individual" as "individual" | "company" | "",
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
        price: 0,
        selected: "no" as "yes" | "no",
      },
    ],

    accepted: false,
  },
});
