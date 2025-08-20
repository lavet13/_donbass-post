import { withForm } from "@/hooks/form";
import { defaultPickUpPointDeliveryOrderOpts } from "@/features/pick-up-point-delivery-order/shared-form";
import { Suspend } from "@/components/suspend";
import z from "zod";
import { cn, getEmailErrorMessage } from "@/lib/utils";
import { useDeliveryCompaniesQuery } from "@/features/delivery-company/queries";
import { usePointPostQuery } from "@/features/point/queries";
import { Toggle } from "@/components/ui/toggle";
import { useAdditionalServicePickUpQuery } from "@/features/additional-service/queries";
import { Fragment, useEffect } from "react";
import { FormItem } from "@/components/ui/form";
import { ChevronDown, ChevronUp, Loader2, TriangleAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { TypographyH3 } from "@/components/ui/typography/typographyH3";

const emailSchema = z.email({ pattern: z.regexes.email });

export const PickUpPointDeliveryOrderForm = withForm({
  ...defaultPickUpPointDeliveryOrderOpts,
  render({ form }) {
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
      isFetching: isAdditionalServiceFetching,
      refetch: refetchAdditionalServices,
    } = useAdditionalServicePickUpQuery();

    useEffect(() => {
      form.setFieldValue(
        "additionalService",
        additionalServices?.map((s) => ({ ...s, selected: "no" })) ?? [],
      );
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
        <TypographyH3 className="text-primary">Отправитель</TypographyH3>
        <form.AppField
          name="sender.type"
          children={(field) => {
            return (
              <div className={cn(field.state.value === "" && "pb-2")}>
                <field.RadioGroupField
                  options={[
                    { label: "Физ лицо", value: "individual" },
                    { label: "Компания", value: "company" },
                  ]}
                  ariaLabel={
                    "Выберите физ. лицо отправителя или компания отправителя"
                  }
                />
              </div>
            );
          }}
        />

        <form.Subscribe
          selector={(state) => state.values.sender.type}
          children={(senderType) => {
            if (senderType !== "individual") return null;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2 sm:pl-2 sm:ml-1 sm:border-l-3 border-ring rounded-l-xs my-2">
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
                        <div className="flex flex-col">
                          <field.PhoneField
                            label="Телефон"
                            ariaLabel="Заполните телефон физического лица"
                            placeholder="Заполните телефон"
                          />
                          <div className="flex flex-wrap justify-center gap-2">
                            <form.AppField
                              name="sender.telegramSender"
                              children={(field) => {
                                return (
                                  <field.CheckboxField
                                    className="self-center"
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
                                    className="self-center"
                                    label="WhatsApp"
                                    ariaLabel="Заполните ватсап физического лица"
                                  />
                                );
                              }}
                            />
                          </div>
                        </div>
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
                  <form.AppField
                    name="sender.pointFrom"
                    children={(field) => {
                      return (
                        <field.ComboboxField
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
              </div>
            );
          }}
        />

        <form.Subscribe
          selector={(state) => state.values.sender.type}
          children={(senderType) => {
            if (senderType !== "company") return null;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 py-2 sm:pl-2 sm:ml-1 sm:border-l-3 border-ring rounded-l-xs my-2">
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
                        <field.ComboboxField
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
              </div>
            );
          }}
        />

        <TypographyH3 className="text-primary">Получатель</TypographyH3>
        <form.AppField
          name="recipient.type"
          children={(field) => {
            return (
              <div className={cn(field.state.value === "" && "pb-2")}>
                <field.RadioGroupField
                  options={[
                    { label: "Физ лицо", value: "individual" },
                    { label: "Компания", value: "company" },
                  ]}
                  ariaLabel={
                    "Выберите физ. лицо получателя или компания получателя"
                  }
                />
              </div>
            );
          }}
        />

        <form.Subscribe
          selector={(state) => state.values.recipient.type}
          children={(recipientType) => {
            if (recipientType !== "individual") return null;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 py-2 sm:pl-2 sm:ml-1 sm:border-l-3 border-ring rounded-l-xs my-2">
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
                        <div className="flex flex-col">
                          <field.PhoneField
                            label="Телефон"
                            ariaLabel="Заполните телефон физического лица получателя"
                            placeholder="Заполните телефон"
                          />
                          <div className="flex flex-wrap justify-center gap-2">
                            <form.AppField
                              name="recipient.telegramRecipient"
                              children={(field) => {
                                return (
                                  <field.CheckboxField
                                    className="self-center"
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
                                    className="self-center"
                                    label="WhatsApp"
                                    ariaLabel="Заполните ватсап физического лица получателя"
                                  />
                                );
                              }}
                            />
                          </div>
                        </div>
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
              </div>
            );
          }}
        />

        <form.Subscribe
          selector={(state) => state.values.recipient.type}
          children={(recipientType) => {
            if (recipientType !== "company") return null;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 py-2 sm:pl-2 sm:ml-1 sm:border-l-3 border-ring rounded-l-xs my-2">
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
              </div>
            );
          }}
        />

        <form.AppField
          name="customer.isToggled"
          children={(field) => {
            return (
              <div className={cn(!field.state.value && "py-2")}>
                <TypographyH3 className="text-primary">Заказчик</TypographyH3>
                <Toggle
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "border-accent border data-[state=on]:bg-primary dark:data-[state=on]:bg-primary data-[state=on]:text-primary-foreground w-full sm:w-fit",
                    "sm:rounded-bl-sm",
                    "data-[state=on]:-mb-px data-[state=on]:rounded-bl-none data-[state=on]:rounded-br-none sm:data-[state=on]:rounded-b-sm sm:data-[state=on]:mb-0",
                  )}
                  pressed={field.state.value}
                  onPressedChange={field.handleChange}
                >
                  <span className="truncate">Заказчик(по выбору клиента)</span>
                  {field.state.value ? <ChevronDown /> : <ChevronUp />}
                </Toggle>
              </div>
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
                    <div
                      className={cn(
                        "sm:pl-2 sm:ml-1 sm:border-l-3 border-ring rounded-tl-xs ",
                        "sm:mt-2 [&_button]:first-of-type:rounded-tl-none [&_button]:last-of-type:rounded-tr-none [&_span]:group-first-of-type:rounded-tl-none [&_span]:group-last-of-type:rounded-tr-none [&_button]:last-of-type:mr-0",
                        "sm:[&_button]:first-of-type:rounded-l-sm sm:[&_button]:last-of-type:rounded-r-sm sm:[&_span]:group-first-of-type:rounded-l-sm sm:[&_span]:group-last-of-type:rounded-r-sm sm:[&_button]:last-of-type:-mr-px",
                      )}
                    >
                      <field.RadioGroupField
                        options={[
                          { label: "Физ лицо", value: "individual" },
                          { label: "Компания", value: "company" },
                        ]}
                        ariaLabel={
                          "Выберите физ. лицо заказчика или компания заказчика"
                        }
                      />
                    </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 pt-2 mb-4 sm:pl-2 sm:ml-1 sm:border-l-3 border-ring rounded-bl-xs">
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
                        <div className="flex flex-col">
                          <field.PhoneField
                            label="Телефон"
                            placeholder="Заполните телефон"
                            ariaLabel="Заполните телефон заказчика"
                          />
                          <div className="flex flex-wrap justify-center gap-2">
                            <form.AppField
                              name="customer.telegramCustomer"
                              children={(field) => {
                                return (
                                  <field.CheckboxField
                                    className="self-center"
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
                                    className="self-center"
                                    label="WhatsApp"
                                    ariaLabel="Заполните ватсап заказчика"
                                  />
                                );
                              }}
                            />
                          </div>
                        </div>
                      );
                    }}
                  />
                </Suspend>
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 pt-2 mb-4 sm:pl-2 sm:ml-1 sm:border-l-3 border-ring rounded-bl-xs">
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
              </div>
            );
          }}
        />

        <TypographyH3 className="text-primary">Данные о грузе</TypographyH3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 mt-2 mb-4">
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
            listeners={{
              onChange: ({ value }) => {
                const { long, width, height } = form.state.values.cargoData;
                const hasAllFilled = !!(long && width && height);
                if (value <= 0 && hasAllFilled) {
                  form.setFieldValue("cargoData.long", 0);
                  form.setFieldValue("cargoData.width", 0);
                  form.setFieldValue("cargoData.height", 0);
                }
              },
            }}
            validators={{
              onChange: ({ value }) => {
                if (value < 0) {
                  return "Должно быть больше нуля!";
                }
                if (value > 25) {
                  return "Не должен превышать 25";
                }
                return undefined;
              },
            }}
            children={(field) => {
              const hasAllFilled = !!(
                form.getFieldValue("cargoData.width") &&
                form.getFieldValue("cargoData.long") &&
                form.getFieldValue("cargoData.height")
              );
              return (
                <field.NumericField
                  label="Метр кубический"
                  placeholder="Метр кубический"
                  suffix=" м³"
                  decimalScale={5}
                  thousandSeparator=","
                  disabled={hasAllFilled}
                />
              );
            }}
          />

          <form.AppField
            name="cargoData.long"
            listeners={{
              onChange: ({ value: long }) => {
                const { width, height } = form.state.values.cargoData;
                form.setFieldValue(
                  "cargoData.cubicMeter",
                  (width * height * long) / 1_000_000,
                );
              },
            }}
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
            listeners={{
              onChange: ({ value: width }) => {
                const { long, height } = form.state.values.cargoData;
                form.setFieldValue(
                  "cargoData.cubicMeter",
                  (width * height * long) / 1_000_000,
                );
              },
            }}
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
            listeners={{
              onChange: ({ value: height }) => {
                const { long, width } = form.state.values.cargoData;
                form.setFieldValue(
                  "cargoData.cubicMeter",
                  (width * height * long) / 1_000_000,
                );
              },
            }}
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
        </div>

        <div className="w-full text-primary inline-flex text-sm [&_svg]:self-start leading-none gap-2 justify-center items-center mb-3 [&_svg]:size-4.5 [&_svg]:shrink-0">
          <TriangleAlert />
          <p>Габариты указываются по самой большой позиции груза</p>
        </div>

        <form.AppField
          name="cargoData.description"
          children={(field) => {
            return (
              <div className="mb-4">
                <field.TextareaField
                  label="Краткое описание"
                  placeholder="Краткое описание"
                />
              </div>
            );
          }}
        />

        {isAdditionalServiceLoading && (
          <div className="flex items-center justify-center py-1.5">
            <Loader2 className="text-primary animate-spin" />
          </div>
        )}
        {!additionalServices && !isAdditionalServiceLoading && (
          <div className="py-2 w-full flex flex-col gap-2 items-center justify-center">
            Не удалось загрузить дополнительные услуги
            <Button
              onClick={() => refetchAdditionalServices()}
              size="sm"
              variant="secondary"
            >
              {isAdditionalServiceFetching && (
                <Loader2 className={"animate-spin"} />
              )}
              Попробовать еще раз
            </Button>
          </div>
        )}
        <form.AppField
          name="additionalService"
          mode="array"
          children={(field) => {
            return (
              <Fragment>
                <TypographyH3 className="text-primary">
                  Дополнительные услуги
                </TypographyH3>
                <div className="flex flex-wrap flex-col sm:flex-row gap-x-4 gap-y-2 mt-3 sm:mt-2 mb-4">
                  {additionalServices &&
                    field.state.value.map((_, i) => (
                      <form.AppField
                        key={i}
                        name={`additionalService[${i}].selected`}
                        children={(selectedField) => {
                          const label = form.getFieldValue(
                            `additionalService[${i}].label`,
                          );
                          const isCashOnDelivery = label
                            .toLowerCase()
                            .includes("наложенный платеж");
                          const isSelected =
                            selectedField.state.value.includes("yes");

                          return (
                            <FormItem className="flex-1 gap-y-1 sm:gap-y-1 items-stretch">
                              <selectedField.RadioGroupField
                                label={label}
                                stretched
                                options={[
                                  { label: "Да", value: "yes" },
                                  { label: "Нет", value: "no" },
                                ]}
                                ariaLabel={`Дополнительная услуга '${label}'`}
                              />
                              <form.AppField
                                name="cargoData.cashOnDelivery"
                                children={(field) => {
                                  if (!isCashOnDelivery) return null;
                                  if (!isSelected) return null;

                                  return (
                                    <field.NumericField
                                      shouldFocusOnMount
                                      placeholder="Наложенный платеж в рублях"
                                      thousandSeparator=" "
                                      suffix=" ₽"
                                    />
                                  );
                                }}
                              />
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                </div>
              </Fragment>
            );
          }}
        />

        <TypographyH3 className="text-primary">Оплата</TypographyH3>
        <div className="sm:grid sm:grid-cols-2 flex flex-col gap-x-4 gap-y-2 mt-2 mb-4">
          <form.AppField
            name="cargoData.shippingPayment"
            children={(field) => {
              return (
                <field.SelectField
                  options={[
                    {
                      label: "Плательщик доставки",
                      items: [
                        { label: "Отправитель", value: "Отправитель" },
                        { label: "Получатель", value: "Получатель" },
                        { label: "Третье лицо", value: "Третье лицо" },
                      ],
                    },
                  ]}
                  label="Плательщик доставки"
                  placeholder="Выберите плательщика..."
                />
              );
            }}
          />
        </div>

        <form.AppField
          name="accepted"
          children={(field) => (
            <field.CheckboxField label="Подтверждаю, что мне исполнилось 14 лет, и ознакомился с правилами предоставления услуг" />
          )}
        />

        <form.AppForm>
          <form.SubscribeButton
            loadingMessage="Оформляем заявку"
            label="Оформить заявку"
          />
        </form.AppForm>
      </form>
    );
  },
});
