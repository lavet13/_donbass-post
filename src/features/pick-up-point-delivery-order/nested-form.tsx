import { withForm } from "@/hooks/form";
import { defaultPickUpPointDeliveryOrderOpts } from "@/features/pick-up-point-delivery-order/shared-form";
import { useStore } from "@tanstack/react-form";
import { Fragment } from "react/jsx-runtime";
import { Suspend } from "@/components/suspend";
import z from "zod";
import { getEmailErrorMessage } from "@/lib/utils";
import { useDeliveryCompaniesQuery } from "../delivery-company/queries";
import { usePointPostQuery } from "../point/queries";
import { Button } from "@/components/ui/button";

const emailSchema = z.email({ pattern: z.regexes.email });

export const PickUpPointDeliveryOrderForm = withForm({
  ...defaultPickUpPointDeliveryOrderOpts,
  render({ form }) {
    const senderType = useStore(
      form.store,
      (state) => state.values.sender.type,
    );
    console.log({ senderType });

    const {
      data: points,
      isLoading: isPointsLoading,
      refetch: refetchPoints,
    } = usePointPostQuery();

    const {
      data: deliveryCompanies,
      isLoading: isDeliveryCompaniesLoading,
      refetch: refetchDeliveryCompanies,
    } = useDeliveryCompaniesQuery();
    console.log({ deliveryCompanies });

    return (
      <form
        className="w-full max-w-2xl px-2 md:px-0"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.AppField
          name="sender.type"
          children={(field) => {
            return (
              <field.RadioGroupField
                options={[
                  { label: "Физ лицо", value: "individual" },
                  { label: "Компания", value: "company" },
                ]}
                ariaLabel={
                  "Выберите физ. лицо отправителя или компания отправителя"
                }
              />
            );
          }}
        />

        <form.Subscribe
          selector={(state) => state.values.sender.type}
          children={(senderType) => {
            if (senderType !== "individual") return null;

            return (
              <Fragment>
                <Suspend>
                  <form.AppField
                    name="sender.surnameSender"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="Фамилия"
                          ariaLabel="Заполните фамилию физического лица"
                          placeholder="Иванов"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="sender.nameSender"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="Имя"
                          ariaLabel="Заполните имя физического лица"
                          placeholder={"Иван"}
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="sender.patronymicSender"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="Отчество"
                          ariaLabel="Заполните отчество физического лица"
                          placeholder="Иванович"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="sender.phoneSender"
                    children={(field) => {
                      return (
                        <field.PhoneField
                          label="Телефон"
                          ariaLabel="Заполните телефон физического лица"
                          placeholder="Заполните телефон"
                        />
                      );
                    }}
                  />
                  <div className="flex justify-center gap-2">
                    <form.AppField
                      name="sender.telegramSender"
                      children={(field) => {
                        return (
                          <field.CheckboxField
                            label="Telegram"
                            ariaLabel="Заполните телеграм физического лица"
                          />
                        );
                      }}
                    />
                    <form.AppField
                      name="sender.whatsAppSender"
                      children={(field) => {
                        return (
                          <field.CheckboxField
                            label="WhatsApp"
                            ariaLabel="Заполните ватсап физического лица"
                          />
                        );
                      }}
                    />
                  </div>
                  <form.AppField
                    name="sender.innSender"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="ИНН"
                          placeholder="Укажите ИНН"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="sender.pointFrom"
                    children={(field) => {
                      return (
                        <field.ComboboxGroupField
                          label="Населенный пункт"
                          placeholder="Выберите населенный пункт"
                          searchEmptyMessage="Нет населенных пунктов"
                          aria-label="Выберите удобный по местоположению населенный пункт из списка"
                          loadingMessage="Загружаем населенные пункты"
                          searchInputPlaceholder="Найти населенный пункт..."
                          refetch={refetchPoints}
                          isLoading={isPointsLoading}
                          values={points}
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="sender.pickupAddress"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="Адрес"
                          placeholder="Адрес"
                          aria-label="Запишите адрес физического лица"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="sender.emailSender"
                    validators={{
                      onChange: ({ value }) => {
                        const result = emailSchema.safeParse(value);

                        if (result.error) {
                          return getEmailErrorMessage(value);
                        }

                        return undefined;
                      },
                    }}
                    children={(field) => {
                      return (
                        <field.TextField
                          label="E-mail"
                          placeholder="example@mail.ru"
                          aria-label="Укажите адрес электронной почты физического лица"
                        />
                      );
                    }}
                  />
                </Suspend>
              </Fragment>
            );
          }}
        />

        <form.Subscribe
          selector={(state) => state.values.sender.type}
          children={(senderType) => {
            if (senderType !== "company") return null;

            return (
              <Fragment>
                <Suspend>
                  <form.AppField
                    name="sender.companySender"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="Компания"
                          placeholder="Компания"
                          ariaLabel="Заполните название компании/организации"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="sender.phoneSender"
                    children={(field) => {
                      return (
                        <field.PhoneField
                          label="Телефон"
                          ariaLabel="Заполните телефон компании"
                          placeholder="Заполните телефон"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="sender.emailSender"
                    validators={{
                      onChange: ({ value }) => {
                        const result = emailSchema.safeParse(value);

                        if (result.error) {
                          return getEmailErrorMessage(value);
                        }

                        return undefined;
                      },
                    }}
                    children={(field) => {
                      return (
                        <field.TextField
                          label="E-mail"
                          placeholder="example@mail.ru"
                          aria-label="Укажите адрес электронной почты компании"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="sender.pointFrom"
                    children={(field) => {
                      return (
                        <field.ComboboxGroupField
                          searchEmptyMessage="Нет населенных пунктов"
                          aria-label="Выберите удобный по местоположению населенный пункт из списка"
                          loadingMessage="Загружаем населенные пункты"
                          searchInputPlaceholder="Найти населенный пункт..."
                          label="Населенный пункт"
                          placeholder="Выберите населенный пункт"
                          refetch={refetchPoints}
                          isLoading={isPointsLoading}
                          values={points}
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="sender.pickupAddress"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="Адрес"
                          placeholder="Адрес"
                          aria-label="Запишите адрес физического лица"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="sender.innSender"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="ИНН"
                          placeholder="Укажите ИНН"
                        />
                      );
                    }}
                  />
                </Suspend>
              </Fragment>
            );
          }}
        />

        <form.AppField
          name="recipient.type"
          children={(field) => {
            return (
              <field.RadioGroupField
                options={[
                  { label: "Физ лицо", value: "individual" },
                  { label: "Компания", value: "company" },
                ]}
                ariaLabel={
                  "Выберите физ. лицо получателя или компания получателя"
                }
              />
            );
          }}
        />

        <form.Subscribe
          selector={(state) => state.values.recipient.type}
          children={(recipientType) => {
            if (recipientType !== "individual") return null;

            return (
              <Fragment>
                <Suspend>
                  <form.AppField
                    name="recipient.surnameRecipient"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="Фамилия"
                          placeholder="Иванов"
                          ariaLabel="Заполните фамилию физического лица получателя"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="recipient.nameRecipient"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="Имя"
                          ariaLabel="Заполните имя физического лица получателя"
                          placeholder={"Иван"}
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="recipient.patronymicRecipient"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="Отчество"
                          ariaLabel="Заполните отчество физического лица получателя"
                          placeholder="Иванович"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="recipient.phoneRecipient"
                    children={(field) => {
                      return (
                        <field.PhoneField
                          label="Телефон"
                          ariaLabel="Заполните телефон физического лица получателя"
                          placeholder="Заполните телефон"
                        />
                      );
                    }}
                  />
                  <div className="flex justify-center gap-2">
                    <form.AppField
                      name="recipient.telegramRecipient"
                      children={(field) => {
                        return (
                          <field.CheckboxField
                            label="Telegram"
                            ariaLabel="Заполните телеграм физического лица получателя"
                          />
                        );
                      }}
                    />
                    <form.AppField
                      name="recipient.whatsAppRecipient"
                      children={(field) => {
                        return (
                          <field.CheckboxField
                            label="WhatsApp"
                            ariaLabel="Заполните ватсап физического лица получателя"
                          />
                        );
                      }}
                    />
                  </div>

                  <form.AppField
                    name="recipient.deliveryCompany"
                    children={(field) => {
                      return (
                        <field.ComboboxField
                          label="Транспортная компания"
                          placeholder="Выберите транспортную компанию"
                          values={deliveryCompanies}
                          refetch={refetchDeliveryCompanies}
                          isLoading={isDeliveryCompaniesLoading}
                          searchEmptyMessage="Нет транспортных компаний"
                          aria-label="Выберите транспортную компанию"
                          loadingMessage="Загружаем транспортные компании"
                          searchInputPlaceholder="Найти транспортную компанию..."
                        />
                      );
                    }}
                  />

                  <form.AppField
                    name="recipient.deliveryAddress"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="Адрес"
                          placeholder="Адрес"
                          aria-label="Запишите адрес физического лица"
                        />
                      );
                    }}
                  />
                </Suspend>
              </Fragment>
            );
          }}
        />

        <form.Subscribe
          selector={(state) => state.values.recipient.type}
          children={(recipientType) => {
            if (recipientType !== "company") return null;

            return (
              <Fragment>
                <Suspend>
                  <form.AppField
                    name="recipient.companyRecipient"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="Компания"
                          placeholder="Компания"
                          ariaLabel="Заполните название компании/организации"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="recipient.phoneRecipient"
                    children={(field) => {
                      return (
                        <field.PhoneField
                          label="Телефон"
                          ariaLabel="Заполните телефон компании"
                          placeholder="Заполните телефон"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="recipient.emailRecipient"
                    validators={{
                      onChange: ({ value }) => {
                        const result = emailSchema.safeParse(value);

                        if (result.error) {
                          return getEmailErrorMessage(value);
                        }

                        return undefined;
                      },
                    }}
                    children={(field) => {
                      return (
                        <field.TextField
                          label="E-mail"
                          placeholder="example@mail.ru"
                          aria-label="Укажите адрес электронной почты компании"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="recipient.deliveryAddress"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="Адрес"
                          placeholder="Адрес"
                          aria-label="Запишите адрес компании"
                        />
                      );
                    }}
                  />

                  <form.AppField
                    name="recipient.innRecipient"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="ИНН"
                          placeholder="Укажите ИНН"
                        />
                      );
                    }}
                  />

                  <form.AppField
                    name="recipient.deliveryCompany"
                    children={(field) => {
                      return (
                        <field.ComboboxField
                          label="Транспортная компания"
                          placeholder="Выберите транспортную компанию"
                          values={deliveryCompanies}
                          refetch={refetchDeliveryCompanies}
                          isLoading={isDeliveryCompaniesLoading}
                          searchEmptyMessage="Нет транспортных компаний"
                          aria-label="Выберите транспортную компанию"
                          loadingMessage="Загружаем транспортные компании"
                          searchInputPlaceholder="Найти транспортную компанию..."
                        />
                      );
                    }}
                  />
                </Suspend>
              </Fragment>
            );
          }}
        />

        <form.AppField
          name="customer.isToggled"
          children={(field) => {
            return null;
          }}
        />

        <form.Subscribe
          selector={(state) => state.values.customer.isToggled}
          children={(customerIsToggled) => {
            if (!customerIsToggled) return null;

            return (
              <form.AppField
                name="customer.type"
                children={(field) => {
                  return (
                    <field.RadioGroupField
                      options={[
                        { label: "Физ лицо", value: "individual" },
                        { label: "Компания", value: "company" },
                      ]}
                      ariaLabel={
                        "Выберите физ. лицо заказчика или компания заказчика"
                      }
                    />
                  );
                }}
              />
            );
          }}
        />

        <form.AppField
          name="accepted"
          children={(field) => (
            <field.CheckboxField label="Подтверждаю, что мне исполнилось 14 лет, и ознакомился с правилами предоставления услуг" />
          )}
        />

        <form.AppForm>
          <form.SubscribeButton label="Зарегистрировать" />
        </form.AppForm>
      </form>
    );
  },
});
