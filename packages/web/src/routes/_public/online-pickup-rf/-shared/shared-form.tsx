import { formOptions } from "@tanstack/react-form";

export const defaultOnlinePickupRFOpts = formOptions({
  defaultValues: {
    surnameSender: "",
    nameSender: "",
    patronymicSender: "",
    phoneSender: "",
    telegramSender: false,
    whatsAppSender: false,
    cityRegion: "",
    pickupAddress: "",
    pickupTime: "",

    totalWeight: 0,
    cubicMeter: 0,

    // Additional fields for calculating cubicMeter
    long: 0,
    width: 0,
    height: 0,

    description: "",

    surnameRecipient: "",
    nameRecipient: "",
    patronymicRecipient: "",
    phoneRecipient: "",
    telegramRecipient: false,
    whatsAppRecipient: false,
    emailRecipient: "",

    deliveryRecipientType: "pointTo" as "" | "pointTo" | "pickupAddress",

    pointTo: "",
    pickupAddressRecipient: "",

    shippingPayment: "",

    customerIsToggled: false,

    // Optional customer
    surnameCustomer: "",
    nameCustomer: "",
    patronymicCustomer: "",
    phoneCustomer: "",

    accepted: false,
  },
});
