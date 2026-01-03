import { formOptions } from "@tanstack/react-form";
import { defaultOnSubmitInvalid } from "@/hooks/form";
import type { ReactNode } from "react";
import type { AutoDismissMessageProps } from "@/components/ui/auto-dismiss-message";

type FormMeta = {
  setMessage?: React.Dispatch<React.SetStateAction<ReactNode>>;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setVariant?: React.Dispatch<
    React.SetStateAction<AutoDismissMessageProps["variant"]>
  >;
};

const defaultMeta: FormMeta = {};

export const defaultOnlinePickupRFOpts = formOptions({
  onSubmitMeta: defaultMeta,
  onSubmitInvalid: defaultOnSubmitInvalid,
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
