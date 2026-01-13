import { type FC } from "react";
import { defaultPickUpPointDeliveryOrderOpts } from "@/routes/_public/pick-up-point-delivery-order/-shared/shared-form";
import { PickUpPointDeliveryOrderForm } from "@/routes/_public/pick-up-point-delivery-order/-shared/nested-form";
import { useAppForm } from "@donbass-post/forms/form";
import { Suspend } from "@/components/suspend";
import { useAdditionalServicePickUpQuery } from "@/features/additional-service/queries";
import { usePickUpPointDeliveryOrderMutation } from "@/features/pick-up-point-delivery-order/mutations";
import { isAxiosError } from "axios";
import type { PickUpPointDeliveryOrderVariables } from "@/features/pick-up-point-delivery-order/types";

const PickUpPointDeliveryOrderPage: FC = () => {
  const { mutateAsync: sendPickUpPointDeliveryOrder } =
    usePickUpPointDeliveryOrderMutation();

  const { data: additionalServices } = useAdditionalServicePickUpQuery();

  const { defaultValues, ...restDefaults } =
    defaultPickUpPointDeliveryOrderOpts;

  const form = useAppForm({
    ...restDefaults,

    // as suggested to use type assertion here: https://github.com/TanStack/form/issues/1175#issuecomment-2681350658
    defaultValues: {
      ...defaultValues,
      additionalService:
        additionalServices?.map((s) => ({ ...s, selected: "no" })) ?? [],
    } as (typeof defaultPickUpPointDeliveryOrderOpts)["defaultValues"],

    onSubmit: async ({ value, formApi, meta }) => {
      const payload = transformFormDataToPayload(value);

      try {
        await sendPickUpPointDeliveryOrder(payload);
        formApi.reset();
      } catch (error) {
        if (isAxiosError(error)) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx

            const errors = error.response.data.message as Record<
              string,
              string
            >[];
            const status = error.response.status;

            if (status === 400) {
              formApi.setErrorMap({
                onChange: {
                  fields: errors[0],
                },
              });
            }

            if (status >= 500) {
              console.error("Server is out");
              meta.setOpen?.(true);
              meta.setMessage?.(["Сервер не отвечает. Попробуйте позже."]);
              meta.setVariant?.("error");
            }
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            if (import.meta.env.DEV) console.warn({ request: error.request });
          } else {
            // Something happened in setting up the request that triggered an Error
            if (import.meta.env.DEV) console.warn("Error", error.message);
          }
        } else {
          if (import.meta.env.DEV) console.error("Unknown error");
        }
      }
    },
  });

  return (
    <Suspend>
      <div className="mx-auto w-full max-w-4xl">
        <PickUpPointDeliveryOrderForm form={form} />
      </div>
    </Suspend>
  );
};

function transformFormDataToPayload(
  value: (typeof defaultPickUpPointDeliveryOrderOpts)["defaultValues"],
): PickUpPointDeliveryOrderVariables {
  const payload: Partial<PickUpPointDeliveryOrderVariables> = {};

  // Handle sender
  const { type: senderType, ...senderRest } = value.sender;

  if (senderType === "individual") {
    const {
      nameSender,
      surnameSender,
      patronymicSender,
      phoneSender,
      telegramSender,
      whatsAppSender,
      pointFrom,
      pickupAddress,
      emailSender,
    } = senderRest;

    payload.sender = {
      nameSender,
      surnameSender,
      patronymicSender,
      phoneSender,
      telegramSender,
      whatsAppSender,
      pointFrom: pointFrom
        ? Number.parseInt(pointFrom, 10)
        : (undefined as unknown as number),
      pickupAddress,
      emailSender,
    };
  } else {
    const {
      companySender: companySenderField,
      phoneSender,
      emailSender,
      pointFrom,
      pickupAddress,
      innSender,
    } = senderRest;

    payload.companySender = {
      companySender: companySenderField,
      phoneSender,
      emailSender,
      pointFrom: pointFrom
        ? Number.parseInt(pointFrom, 10)
        : (undefined as unknown as number),
      pickupAddress,
      innSender,
    };
  }

  // Handle recipient
  const { type: recipientType, ...recipientRest } = value.recipient;

  if (recipientType === "individual") {
    const {
      nameRecipient,
      surnameRecipient,
      patronymicRecipient,
      phoneRecipient,
      telegramRecipient,
      whatsAppRecipient,
      deliveryCompany,
      deliveryAddress,
      pointTo,
    } = recipientRest;

    payload.recipient = {
      nameRecipient,
      surnameRecipient,
      patronymicRecipient,
      phoneRecipient,
      telegramRecipient,
      whatsAppRecipient,
      deliveryCompany: deliveryCompany
        ? Number.parseInt(deliveryCompany, 10)
        : (undefined as unknown as number),
      deliveryAddress,
      pointTo: pointTo
        ? Number.parseInt(pointTo, 10)
        : (undefined as unknown as number),
    };
  } else {
    const {
      companyRecipient: companyRecipientField,
      phoneRecipient,
      emailRecipient,
      deliveryAddress,
      innRecipient,
      deliveryCompany,
      pointTo,
    } = recipientRest;

    payload.companyRecipient = {
      companyRecipient: companyRecipientField,
      phoneRecipient,
      emailRecipient,
      deliveryAddress,
      innRecipient,
      deliveryCompany: deliveryCompany
        ? Number.parseInt(deliveryCompany, 10)
        : (undefined as unknown as number),
      pointTo: pointTo
        ? Number.parseInt(pointTo, 10)
        : (undefined as unknown as number),
    };
  }

  // Handle customer (only if toggled)
  const { type: customerType, isToggled, ...customerRest } = value.customer;

  if (isToggled) {
    if (customerType === "individual") {
      const {
        nameCustomer,
        surnameCustomer,
        patronymicCustomer,
        phoneCustomer,
        telegramCustomer,
        whatsAppCustomer,
      } = customerRest;

      payload.customer = {
        nameCustomer,
        surnameCustomer,
        patronymicCustomer,
        phoneCustomer,
        telegramCustomer,
        whatsAppCustomer,
      };
    } else {
      const {
        companyCustomer: companyCustomerField,
        phoneCustomer,
        emailCustomer,
        innCustomer,
      } = customerRest;

      payload.companyCustomer = {
        companyCustomer: companyCustomerField,
        phoneCustomer,
        emailCustomer,
        innCustomer,
      };
    }
  }

  // Handle cargo data and additional services
  payload.cargoData = {
    ...value.cargoData,
    cashOnDelivery: value.cargoData.cashOnDelivery || undefined,
  };

  payload.additionalService = value.additionalService
    .filter((service) => service.selected === "yes")
    .map((service) => ({ id: service.value }));

  return payload as PickUpPointDeliveryOrderVariables;
}

export default PickUpPointDeliveryOrderPage;
