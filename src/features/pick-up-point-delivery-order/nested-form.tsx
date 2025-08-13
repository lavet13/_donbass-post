import { withForm } from "@/hooks/form";
import { defaultPickUpPointDeliveryOrderOpts } from "@/features/pick-up-point-delivery-order/shared-form";
import { useStore } from "@tanstack/react-form";
import { Fragment } from "react/jsx-runtime";
import { Suspend } from "@/components/suspend";
import z from "zod";
import { getEmailErrorMessage } from "@/lib/utils";
import { useDeliveryCompaniesQuery } from "@/features/delivery-company/queries";
import { usePointPostQuery } from "@/features/point/queries";
import { Toggle } from "@/components/ui/toggle";
import { useAdditionalServicePickUpQuery } from "../additional-service/queries";
import { useMemo } from "react";

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

    const {
      data: additionalServices,
      isLoading: isAdditionalServiceLoading,
      refetch: refetchAdditionalServices,
    } = useAdditionalServicePickUpQuery();
    console.log({ additionalServices });

    useMemo(() => {
      form.setFieldValue("additionalService", additionalServices ?? []);
    }, [additionalServices]);

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
            return (
              <Toggle
                pressed={field.state.value}
                onPressedChange={field.handleChange}
              >
                Заказчик(по выбору клиента)
              </Toggle>
            );
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

        <form.Subscribe
          selector={(state) => [
            state.values.customer.type,
            state.values.customer.isToggled,
          ]}
          children={([customerType, customerIsToggled]) => {
            if (!customerIsToggled) return null;
            if (customerType !== "individual") return null;
            return (
              <Fragment>
                <Suspend>
                  <form.AppField
                    name="customer.surnameCustomer"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="Фамилия"
                          placeholder="Иванов"
                          ariaLabel="Заполните фамилию физического лица заказчика"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="customer.nameCustomer"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="Имя"
                          placeholder="Иван"
                          ariaLabel="Заполните имя физического лица заказчика"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="customer.patronymicCustomer"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="Отчество"
                          placeholder="Иванович"
                          ariaLabel="Заполните отчество физического лица заказчика"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="customer.phoneCustomer"
                    children={(field) => {
                      return (
                        <field.PhoneField
                          label="Телефон"
                          placeholder="Заполните телефон"
                          ariaLabel="Заполните телефон заказчика"
                        />
                      );
                    }}
                  />
                  <div className="flex justify-center gap-2">
                    <form.AppField
                      name="customer.telegramCustomer"
                      children={(field) => {
                        return (
                          <field.CheckboxField
                            label="Telegram"
                            ariaLabel="Заполните телеграм заказчика"
                          />
                        );
                      }}
                    />
                    <form.AppField
                      name="customer.whatsAppCustomer"
                      children={(field) => {
                        return (
                          <field.CheckboxField
                            label="WhatsApp"
                            ariaLabel="Заполните ватсап заказчика"
                          />
                        );
                      }}
                    />
                  </div>
                </Suspend>
              </Fragment>
            );
          }}
        />

        <form.Subscribe
          selector={(state) => [
            state.values.customer.type,
            state.values.customer.isToggled,
          ]}
          children={([customerType, customerIsToggled]) => {
            if (!customerIsToggled) return null;
            if (customerType !== "company") return null;
            return (
              <Fragment>
                <Suspend>
                  <form.AppField
                    name="customer.companyCustomer"
                    children={(field) => {
                      return (
                        <field.TextField
                          label="Компания"
                          placeholder="Компания"
                          ariaLabel="Заполните компанию заказчика"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="customer.phoneCustomer"
                    children={(field) => {
                      return (
                        <field.PhoneField
                          label="Телефон"
                          placeholder="Заполните телефон"
                          ariaLabel="Заполните телефон заказчика компании"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="customer.emailCustomer"
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
                          aria-label="Укажите адрес электронной почты заказчика компании"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="customer.innCustomer"
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
          name="cargoData.totalWeight"
          children={(field) => {
            return (
              <field.NumericField
                label="Общий вес(кг)"
                placeholder="Общий вес в килограммах"
                suffix=" кг"
                decimalScale={1}
                thousandSeparator=","
              />
            );
          }}
        />

        <form.AppField
          name="cargoData.declaredPrice"
          children={(field) => {
            return (
              <field.NumericField
                label="Заявленная стоимость(в рублях)"
                placeholder="Заявленная стоимость в рублях"
                suffix=" ₽"
                thousandSeparator=" "
              />
            );
          }}
        />

        <form.AppField
          name="cargoData.weightHeaviestPosition"
          children={(field) => {
            return (
              <field.NumericField
                label="Вес самой тяжелой позиции(кг)"
                placeholder="Вес самой тяжелой позиции в килограммах"
                suffix=" кг"
                decimalScale={1}
                thousandSeparator=","
              />
            );
          }}
        />

        <form.AppField
          name="cargoData.cubicMeter"
          children={(field) => {
            return (
              <field.NumericField
                label="Метр кубический"
                placeholder="Метр кубический"
                suffix=" м³"
                decimalScale={5}
                thousandSeparator=","
              />
            );
          }}
        />

        <form.AppField
          name="cargoData.long"
          children={(field) => {
            return (
              <field.NumericField
                label="Длина(см)"
                placeholder="Длина в сантиметрах"
                suffix=" см"
                decimalScale={1}
                thousandSeparator=","
              />
            );
          }}
        />

        <form.AppField
          name="cargoData.width"
          children={(field) => {
            return (
              <field.NumericField
                label="Ширина(см)"
                placeholder="Ширина в сантиметрах"
                suffix=" см"
                decimalScale={1}
                thousandSeparator=","
              />
            );
          }}
        />

        <form.AppField
          name="cargoData.height"
          children={(field) => {
            return (
              <field.NumericField
                label="Высота(см)"
                placeholder="Высота в сантиметрах"
                suffix=" см"
                decimalScale={1}
                thousandSeparator=","
              />
            );
          }}
        />

        <form.AppField
          name="cargoData.description"
          children={(field) => {
            return (
              <field.TextareaField
                label="Краткое описание"
                placeholder="Краткое описание"
              />
            );
          }}
        />

        <form.AppField
          name="additionalService"
          mode="array"
          children={(field) => {
            return (
              <div>
                {field.state.value.map((_, i) => (
                  <>
                    <form.AppField
                      key={i}
                      name={`additionalService[${i}].label`}
                      children={(field) => {
                        return `${field.state.value}, `;
                      }}
                    />
                    <form.AppField
                      name={`additionalService[${i}].value`}
                      children={(field) => {
                        return `id: ${field.state.value}; `;
                      }}
                    />
                  </>
                ))}
              </div>
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
          <form.SubscribeButton loadingMessage="Оформляем заявку" label="Оформить заявку" />
        </form.AppForm>
      </form>
    );
  },
});
