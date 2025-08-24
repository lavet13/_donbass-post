import type { FC } from "react";
import { PickUpPointDeliveryOrderForm } from "@/features/pick-up-point-delivery-order/nested-form";
import { useAppForm } from "@/hooks/form";
import { defaultPickUpPointDeliveryOrderOpts } from "@/features/pick-up-point-delivery-order/shared-form";
import { Suspend } from "@/components/suspend";
import { useAdditionalServicePickUpQuery } from "@/features/additional-service/queries";
import { usePickUpPointDeliveryOrderMutation } from "@/features/pick-up-point-delivery-order/mutations";
import { isAxiosError } from "axios";
import type {
  CompanyCustomer,
  CompanyRecipient,
  CompanySender,
  IndividualCustomer,
  IndividualRecipient,
  IndividualSender,
  PickUpPointDeliveryOrderVariables,
} from "@/features/pick-up-point-delivery-order/types";

const PickUpPointDeliveryOrderPage: FC = () => {
  const { data: additionalServices } = useAdditionalServicePickUpQuery();
  const { mutateAsync: sendPickUpPointDeliveryOrder } =
    usePickUpPointDeliveryOrderMutation();

  const form = useAppForm({
    ...defaultPickUpPointDeliveryOrderOpts,
    onSubmit: async ({ value, formApi }) => {
      const { type: senderType, ...senderRest } = value.sender;

      let sender!: IndividualSender | CompanySender;

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
        sender = {
          nameSender,
          surnameSender,
          patronymicSender,
          phoneSender,
          telegramSender,
          whatsAppSender,
          pointFrom: (pointFrom
            ? Number.parseInt(pointFrom, 10)
            : undefined) as number,
          pickupAddress,
          emailSender,
        } satisfies IndividualSender;
      }

      if (senderType === "company") {
        const {
          companySender,
          phoneSender,
          emailSender,
          pointFrom,
          pickupAddress,
          innSender,
        } = senderRest;

        sender = {
          companySender,
          phoneSender,
          emailSender,
          pointFrom: (pointFrom
            ? Number.parseInt(pointFrom, 10)
            : undefined) as number,
          pickupAddress,
          innSender,
        } satisfies CompanySender;
      }

      const { type: recipientType, ...recipientRest } = value.recipient;
      let recipient!: IndividualRecipient | CompanyRecipient;

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
        } = recipientRest;

        recipient = {
          nameRecipient,
          surnameRecipient,
          patronymicRecipient,
          phoneRecipient,
          telegramRecipient,
          whatsAppRecipient,
          deliveryCompany: ((deliveryCompany
            ? Number.parseInt(deliveryCompany, 10)
            : undefined) as number),
          deliveryAddress,
        } satisfies IndividualRecipient;
      }

      if (recipientType === "company") {
        const {
          companyRecipient,
          phoneRecipient,
          emailRecipient,
          deliveryAddress,
          innRecipient,
          deliveryCompany,
        } = recipientRest;
        console.log({ deliveryCompany });

        recipient = {
          companyRecipient,
          phoneRecipient,
          emailRecipient,
          deliveryAddress,
          innRecipient,
          deliveryCompany: ((deliveryCompany
            ? Number.parseInt(deliveryCompany, 10)
            : undefined) as number),
        } satisfies CompanyRecipient;
      }

      let customer!: IndividualCustomer | CompanyCustomer;
      const { type: customerType, isToggled, ...customerRest } = value.customer;

      if (customerType === "individual") {
        const {
          nameCustomer,
          surnameCustomer,
          patronymicCustomer,
          phoneCustomer,
          telegramCustomer,
          whatsAppCustomer,
        } = customerRest;

        customer = {
          nameCustomer,
          surnameCustomer,
          patronymicCustomer,
          phoneCustomer,
          telegramCustomer,
          whatsAppCustomer,
        } satisfies IndividualCustomer;
      }

      if (customerType === "company") {
        const { companyCustomer, phoneCustomer, emailCustomer, innCustomer } =
          customerRest;

        customer = {
          companyCustomer,
          phoneCustomer,
          emailCustomer,
          innCustomer,
        } satisfies CompanyCustomer;
      }

      const payload: PickUpPointDeliveryOrderVariables = {
        sender,
        recipient,
        ...(isToggled ? customer : {}),
        cargoData: {
          ...value.cargoData,
          cashOnDelivery: value.cargoData.cashOnDelivery || undefined,
        },
        additionalService: value.additionalService
          .filter((service) => service.selected === "yes")
          .map((service) => ({ id: service.value })),
      };
      console.log({ payload });

      try {
        // await sendPickUpPointDeliveryOrder(payload);
        formApi.reset();
        formApi.setFieldValue(
          "additionalService",
          additionalServices?.map((s) => ({ ...s, selected: "no" })) ?? [],
        );
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
              // meta.onSubmit?.((prev) => ({
              //   ...prev,
              //   isOpen: true,
              //   extra: ["Сервер не отвечает. Попробуйте позже."],
              // }));
            }
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            import.meta.env.DEV && console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            import.meta.env.DEV && console.log("Error", error.message);
          }
        } else {
          import.meta.env.DEV && console.error("Unknown error");
        }
      }
    },
  });

  return (
    <Suspend>
      <PickUpPointDeliveryOrderForm form={form} />
    </Suspend>
  );
};

export default PickUpPointDeliveryOrderPage;
