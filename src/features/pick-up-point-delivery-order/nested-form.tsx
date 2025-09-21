import { withForm } from "@/hooks/form";
import { defaultPickUpPointDeliveryOrderOpts } from "@/features/pick-up-point-delivery-order/shared-form";
import { Suspend } from "@/components/suspend";
import z from "zod";
import { cn, getEmailErrorMessage } from "@/lib/utils";
import { useDeliveryCompaniesQuery } from "@/features/delivery-company/queries";
import { usePointPostQuery } from "@/features/point/queries";
import { Toggle } from "@/components/ui/toggle";
import { useAdditionalServicePickUpQuery } from "@/features/additional-service/queries";
import { Fragment, useState } from "react";
import { FormItem } from "@/components/ui/form";
import { ChevronDown, ChevronUp, TriangleAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { TypographyH3 } from "@/components/ui/typography/typographyH3";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { useStore } from "@tanstack/react-form";
import { useBlocker } from "@tanstack/react-router";
import {
  AutoDismissMessage,
  type AutoDimissMessageProps,
} from "@/components/auto-dismiss-message";
import { useCalculateGlobalMutation } from "@/features/delivery-rate/mutations";
import { isAxiosError } from "axios";
import { Icons } from "@/components/icons";

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

    const {
      data: calculateDeliveryResult,
      mutateAsync: calculateDelivery,
      isError,
      error,
      isPending,
    } = useCalculateGlobalMutation();

    const handleCalculation = async () => {
      const pointFrom = Number.parseInt(form.state.values.sender.pointFrom, 10);
      const pointTo = Number.parseInt(form.state.values.recipient.pointTo, 10);
      const deliveryCompany = Number.parseInt(
        form.state.values.recipient.deliveryCompany,
        10,
      );
      const { totalWeight, cubicMeter } = form.state.values.cargoData;

      try {
        await calculateDelivery({
          weight: totalWeight,
          cubicMeter: cubicMeter,
          pointFrom,
          pointTo,
          deliveryCompany,
          isHomeDelivery: false,
          deliveryType: 3,
          deliveryRateGroup: 4,
        });
      } catch (error) {
        if (isAxiosError(error)) {
          if (error.response) {
            const status = error.response.status;
            const errors = error.response?.data.message[0] as Record<
              string,
              string
            >;

            if (status === 400) {
              // validation error
              form.setErrorMap({
                onChange: {
                  fields: {
                    "sender.pointFrom": errors["pointFrom"],
                    "recipient.pointTo": errors["pointTo"],
                    "recipient.deliveryCompany": errors["deliveryCompany"],
                  },
                },
              });
            }
          }
        }
      }
    };

    const isDefaultValue = useStore(
      form.store,
      (state) => state.isDefaultValue,
    );

    useBlocker({
      shouldBlockFn: () => {
        if (isDefaultValue) return false;

        const shouldLeave = confirm(
          "Вы действительно хотите покинуть страницу? Форма была заполнена!",
        );
        return !shouldLeave;
      },
    });

    const [message, setMessage] = useState<AutoDimissMessageProps>({
      title: "Регистрация успешно проведена!",
      variant: "success",
      onClose: () => setMessage((prev) => ({ ...prev, isOpen: false })),
      isOpen: false,
      durationMs: 60_000,
    });

    return (
      <form
        className="mx-auto w-full max-w-2xl"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit({ onSubmit: setMessage });
        }}
      >
        <AutoDismissMessage {...message} />
        <TypographyH3 className="text-primary">Отправитель</TypographyH3>
        <form.AppField
          name="sender.type"
          validators={{
            onChange: ({ value: type }) => {
              if (!type) {
                return "Выберите физ лицо или компанию";
              }
              return undefined;
            },
          }}
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
              <Suspend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2 sm:pl-2 sm:ml-1 sm:border-l-3 border-ring rounded-l-xs my-2">
                  <form.AppField
                    name="sender.surnameSender"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.length) {
                          return "Фамилия обязательна";
                        }
                        if (value.length < 3 || value.length > 50) {
                          return "Фамилия не должна быть короче 3 символов и длиннее 50";
                        }
                        return undefined;
                      },
                    }}
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
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.length) {
                          return "Имя обязательно";
                        }
                        if (value.length < 3 || value.length > 50) {
                          return "Имя не должно быть короче 3 символов и длиннее 50";
                        }
                        return undefined;
                      },
                    }}
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
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.length) {
                          return "Отчество обязательно";
                        }
                        if (value.length < 3 || value.length > 50) {
                          return "Отчество не должно быть короче 3 символов и длиннее 50";
                        }
                        return undefined;
                      },
                    }}
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
                    validators={{
                      onChange: ({ value }) => {
                        return !isPossiblePhoneNumber(value)
                          ? "Проверьте правильно ли ввели номер телефона"
                          : undefined;
                      },
                    }}
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
                    name="sender.pointFrom"
                    validators={{
                      onChange: ({ value }) => {
                        if (typeof value === "string" && !value.length) {
                          return "Выберите населенный пункт";
                        }
                        return undefined;
                      },
                    }}
                    children={(field) => {
                      return (
                        <field.ComboboxField
                          label="Населенный пункт"
                          placeholder="Выберите населенный пункт"
                          searchEmptyMessage="Таких населенных пунктов нет"
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
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.length) {
                          return "Адрес обязателен";
                        }
                        if (value.length < 3 || value.length > 50) {
                          return "Адрес не должно быть короче 3 символов и длиннее 50";
                        }
                        return undefined;
                      },
                    }}
                    children={(field) => {
                      return (
                        <field.TextField
                          hint={
                            <p className="text-base sm:text-sm">
                              Забор груза отправителя
                            </p>
                          }
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
                </div>
              </Suspend>
            );
          }}
        />

        <form.Subscribe
          selector={(state) => state.values.sender.type}
          children={(senderType) => {
            if (senderType !== "company") return null;
            return (
              <Suspend>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 py-2 sm:pl-2 sm:ml-1 sm:border-l-3 border-ring rounded-l-xs my-2">
                  <form.AppField
                    name="sender.companySender"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.length) {
                          return "Компания обязательна";
                        }
                        if (value.length < 3 || value.length > 50) {
                          return "Компания не должна быть короче 3 символов и длиннее 50";
                        }
                        return undefined;
                      },
                    }}
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
                    validators={{
                      onChange: ({ value }) => {
                        return !isPossiblePhoneNumber(value)
                          ? "Проверьте правильно ли ввели номер телефона"
                          : undefined;
                      },
                    }}
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
                    validators={{
                      onChange: ({ value }) => {
                        if (typeof value === "string" && !value.length) {
                          return "Выберите населенный пункт";
                        }
                        return undefined;
                      },
                    }}
                    children={(field) => {
                      return (
                        <field.ComboboxField
                          searchEmptyMessage="Таких населенных пунктов нет"
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
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.length) {
                          return "Адрес обязателен";
                        }
                        if (value.length < 3 || value.length > 50) {
                          return "Адрес не должно быть короче 3 символов и длиннее 50";
                        }
                        return undefined;
                      },
                    }}
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
                    validators={{
                      onChange: ({ value }) => {
                        if (value.length < 10) {
                          return "ИНН должен быть больше 10 символов";
                        }
                        return undefined;
                      },
                    }}
                    children={(field) => {
                      return (
                        <field.TextField
                          onChange={(e) => {
                            const isNotDigit = /[^0-9]/.test(e.target.value);

                            if (isNotDigit) {
                              return;
                            }

                            if (e.target.value.length > 12) {
                              return;
                            }

                            field.handleChange(e.target.value);
                          }}
                          label="ИНН"
                          placeholder="Укажите ИНН"
                        />
                      );
                    }}
                  />
                </div>
              </Suspend>
            );
          }}
        />

        <TypographyH3 className="text-primary">Получатель</TypographyH3>
        <form.AppField
          name="recipient.type"
          validators={{
            onChange: ({ value: type }) => {
              if (!type) {
                return "Выберите Физ лицо или Компанию";
              }
              return undefined;
            },
          }}
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
              <Suspend>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 py-2 sm:pl-2 sm:ml-1 sm:border-l-3 border-ring rounded-l-xs my-2">
                  <form.AppField
                    name="recipient.surnameRecipient"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.length) {
                          return "Фамилия обязательна";
                        }
                        if (value.length < 3 || value.length > 50) {
                          return "Фамилия не должна быть короче 3 символов и длиннее 50";
                        }
                        return undefined;
                      },
                    }}
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
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.length) {
                          return "Имя обязательно";
                        }
                        if (value.length < 3 || value.length > 50) {
                          return "Имя не должно быть короче 3 символов и длиннее 50";
                        }
                        return undefined;
                      },
                    }}
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
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.length) {
                          return "Отчество обязательно";
                        }
                        if (value.length < 3 || value.length > 50) {
                          return "Отчество не должно быть короче 3 символов и длиннее 50";
                        }
                        return undefined;
                      },
                    }}
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
                    validators={{
                      onChange: ({ value }) => {
                        return !isPossiblePhoneNumber(value)
                          ? "Проверьте правильно ли ввели номер телефона"
                          : undefined;
                      },
                    }}
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
                    name="recipient.pointTo"
                    validators={{
                      onChange: ({ value }) => {
                        if (typeof value === "string" && !value.length) {
                          return "Выберите населенный пункт";
                        }
                        return undefined;
                      },
                    }}
                    children={(field) => {
                      return (
                        <field.ComboboxField
                          label="Населенный пункт"
                          placeholder="Выберите населенный пункт"
                          searchEmptyMessage="Таких населенных пунктов нет"
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
                    name="recipient.deliveryCompany"
                    children={(field) => {
                      return (
                        <field.ComboboxField
                          label="Отправить ч/з транспортную компанию"
                          placeholder="Выберите транспортную компанию"
                          values={deliveryCompanies}
                          refetch={refetchDeliveryCompanies}
                          isLoading={isDeliveryCompaniesLoading}
                          searchEmptyMessage="Таких транспортных компаний нет"
                          aria-label="Выберите транспортную компанию"
                          loadingMessage="Загружаем транспортные компании"
                          searchInputPlaceholder="Найти транспортную компанию..."
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="recipient.deliveryAddress"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.length) {
                          return "Адрес получателя или ТК обязателен";
                        }
                        if (value.length < 3 || value.length > 50) {
                          return "Адрес получателя или ТК не должно быть короче 3 символов и длиннее 50";
                        }
                        return undefined;
                      },
                    }}
                    children={(field) => {
                      return (
                        <field.TextField
                          label="Адрес получателя или ТК"
                          placeholder="Адрес получателя или ТК"
                          aria-label="Запишите адрес физического лица"
                        />
                      );
                    }}
                  />
                </div>
              </Suspend>
            );
          }}
        />

        <form.Subscribe
          selector={(state) => state.values.recipient.type}
          children={(recipientType) => {
            if (recipientType !== "company") return null;
            return (
              <Suspend>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 py-2 sm:pl-2 sm:ml-1 sm:border-l-3 border-ring rounded-l-xs my-2">
                  <form.AppField
                    name="recipient.companyRecipient"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.length) {
                          return "Компания обязательна";
                        }
                        if (value.length < 3 || value.length > 50) {
                          return "Компания не должна быть короче 3 символов и длиннее 50";
                        }
                        return undefined;
                      },
                    }}
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
                    validators={{
                      onChange: ({ value }) => {
                        return !isPossiblePhoneNumber(value)
                          ? "Проверьте правильно ли ввели номер телефона"
                          : undefined;
                      },
                    }}
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
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.length) {
                          return "Адрес обязателен";
                        }
                        if (value.length < 3 || value.length > 50) {
                          return "Адрес не должно быть короче 3 символов и длиннее 50";
                        }
                        return undefined;
                      },
                    }}
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
                    validators={{
                      onChange: ({ value }) => {
                        if (value.length < 10) {
                          return "ИНН должен быть больше 10 символов";
                        }
                        return undefined;
                      },
                    }}
                    children={(field) => {
                      return (
                        <field.TextField
                          onChange={(e) => {
                            const isNotDigit = /[^0-9]/.test(e.target.value);

                            if (isNotDigit) {
                              return;
                            }

                            if (e.target.value.length > 12) {
                              return;
                            }

                            field.handleChange(e.target.value);
                          }}
                          label="ИНН"
                          placeholder="Укажите ИНН"
                        />
                      );
                    }}
                  />
                  <form.AppField
                    name="recipient.pointTo"
                    validators={{
                      onChange: ({ value }) => {
                        if (typeof value === "string" && !value.length) {
                          return "Выберите населенный пункт";
                        }
                        return undefined;
                      },
                    }}
                    children={(field) => {
                      return (
                        <field.ComboboxField
                          label="Населенный пункт"
                          placeholder="Выберите населенный пункт"
                          searchEmptyMessage="Таких населенных пунктов нет"
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
                    name="recipient.deliveryCompany"
                    validators={{
                      onChange: ({ value }) => {
                        if (typeof value === "string" && !value.length) {
                          return "Выберите транспортную компанию";
                        }
                        return undefined;
                      },
                    }}
                    children={(field) => {
                      return (
                        <field.ComboboxField
                          label="Транспортная компания(опционально)"
                          placeholder="Выберите транспортную компанию"
                          values={deliveryCompanies}
                          refetch={refetchDeliveryCompanies}
                          isLoading={isDeliveryCompaniesLoading}
                          searchEmptyMessage="Таких транспортных компаний нет"
                          aria-label="Выберите транспортную компанию"
                          loadingMessage="Загружаем транспортные компании"
                          searchInputPlaceholder="Найти транспортную компанию..."
                        />
                      );
                    }}
                  />
                </div>
              </Suspend>
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
                    buttonVariants({ variant: "outline" }),
                    "data-[state=on]:bg-primary data-[state=on]:[box-shadow:none] dark:data-[state=on]:bg-primary data-[state=on]:text-primary-foreground w-full sm:w-fit",
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
                        "sm:pl-2 sm:ml-1 sm:border-l-3 border-ring rounded-tl-xs",
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
              <Suspend>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 pt-2 mb-4 sm:pl-2 sm:ml-1 sm:border-l-3 border-ring rounded-bl-xs">
                  <form.AppField
                    name="customer.surnameCustomer"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.length) {
                          return "Фамилия обязательна";
                        }
                        if (value.length < 3 || value.length > 50) {
                          return "Фамилия не должна быть короче 3 символов и длиннее 50";
                        }
                        return undefined;
                      },
                    }}
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
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.length) {
                          return "Имя обязательно";
                        }
                        if (value.length < 3 || value.length > 50) {
                          return "Имя не должно быть короче 3 символов и длиннее 50";
                        }
                        return undefined;
                      },
                    }}
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
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.length) {
                          return "Отчество обязательно";
                        }
                        if (value.length < 3 || value.length > 50) {
                          return "Отчество не должно быть короче 3 символов и длиннее 50";
                        }
                        return undefined;
                      },
                    }}
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
                    validators={{
                      onChange: ({ value }) => {
                        return !isPossiblePhoneNumber(value)
                          ? "Проверьте правильно ли ввели номер телефона"
                          : undefined;
                      },
                    }}
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
                </div>
              </Suspend>
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
              <Suspend>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 pt-2 mb-4 sm:pl-2 sm:ml-1 sm:border-l-3 border-ring rounded-bl-xs">
                  <form.AppField
                    name="customer.companyCustomer"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value.length) {
                          return "Компания обязательна";
                        }
                        if (value.length < 3 || value.length > 50) {
                          return "Компания не должна быть короче 3 символов и длиннее 50";
                        }
                        return undefined;
                      },
                    }}
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
                    validators={{
                      onChange: ({ value }) => {
                        return !isPossiblePhoneNumber(value)
                          ? "Проверьте правильно ли ввели номер телефона"
                          : undefined;
                      },
                    }}
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
                    validators={{
                      onChange: ({ value }) => {
                        if (value.length < 10) {
                          return "ИНН должен быть больше 10 символов";
                        }
                        return undefined;
                      },
                    }}
                    children={(field) => {
                      return (
                        <field.TextField
                          onChange={(e) => {
                            const isNotDigit = /[^0-9]/.test(e.target.value);

                            if (isNotDigit) {
                              return;
                            }

                            if (e.target.value.length > 12) {
                              return;
                            }

                            field.handleChange(e.target.value);
                          }}
                          label="ИНН"
                          placeholder="Укажите ИНН"
                        />
                      );
                    }}
                  />
                </div>
              </Suspend>
            );
          }}
        />

        <TypographyH3 className="text-primary">Данные о грузе</TypographyH3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 mt-2 mb-4">
          <form.AppField
            name="cargoData.totalWeight"
            validators={{
              onSubmit: ({ value }) => {
                if (value <= 0) {
                  return "Заполните общий вес";
                }
                return undefined;
              },
            }}
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
            validators={{
              onSubmit: ({ value }) => {
                if (value <= 0) {
                  return "Заполните заявленную стоимость";
                }
                return undefined;
              },
            }}
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
            validators={{
              onSubmit: ({ value }) => {
                if (value <= 0) {
                  return "Заполните вес самой тяжелой позиции";
                }
                return undefined;
              },
            }}
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
              onSubmit: ({ value }) => {
                if (value <= 0) {
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
                  hint={
                    <p className="text-base sm:text-sm">
                      Если не знаете объем груза, заполните габариты ниже
                      (длина, ширина, высота)
                    </p>
                  }
                  label="Метр кубический"
                  placeholder="Метр кубический"
                  suffix=" м³"
                  decimalScale={6}
                  thousandSeparator=","
                  disabled={hasAllFilled}
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
        </div>

        <div className="w-full text-primary inline-flex text-sm [&_svg]:self-start leading-none gap-2 justify-center items-center mb-3 [&_svg]:size-4.5 [&_svg]:shrink-0">
          <TriangleAlert />
          <p>Габариты указываются по самой большой позиции груза</p>
        </div>

        <form.AppField
          name="cargoData.description"
          validators={{
            onChange: ({ value }) => {
              if (!value.length) return "Заполните краткое описание";
              if (value.length < 3 || value.length > 50) {
                return "Краткое описание не должно быть короче 3 символов и длиннее 50";
              }
              return undefined;
            },
          }}
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
          <div className="flex gap-2 items-center justify-center py-1.5 text-primary">
            <Icons.spinner />
            Загружаем доп. услуги
          </div>
        )}
        {!additionalServices && !isAdditionalServiceLoading && (
          <div className="py-2 w-full flex flex-col gap-2 items-center justify-center">
            Не удалось загрузить дополнительные услуги
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                refetchAdditionalServices();
              }}
              size="sm"
              variant="outline"
            >
              {isAdditionalServiceFetching && <Icons.spinner />}
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

                              {isSelected && isCashOnDelivery && (
                                <form.AppField
                                  name="cargoData.cashOnDelivery"
                                  validators={{
                                    onSubmit: ({ value }) => {
                                      if (value <= 0) {
                                        return "Укажите наложенный платеж";
                                      }
                                      return undefined;
                                    },
                                  }}
                                  children={(field) => {
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
                              )}
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
            validators={{
              onChange: ({ value }) => {
                if (!value.length) {
                  return "Выберите плательщика доставки";
                }
                return undefined;
              },
            }}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2">
          <form.AppForm>
            <form.SubmitButton
              loadingMessage="Оформляем заявку"
              label="Оформить заявку"
            />
          </form.AppForm>
          <div className="flex flex-col gap-1.5">
            <Button
              disabled={isPending}
              type="button"
              onClick={handleCalculation}
            >
              {isPending ? (
                <>
                  <Icons.spinner className="size-4 text-primary-foreground" />
                  Просчёт...
                </>
              ) : (
                <>Узнать примерную стоимость</>
              )}
            </Button>
            {calculateDeliveryResult && !isError && (
              <div className="flex py-2 text-3xl justify-center items-center bg-accent text-accent-foreground rounded-md font-bold">
                {calculateDeliveryResult.price +
                  (form.state.values.additionalService
                    .filter(
                      ({ selected, label }) =>
                        selected === "yes" &&
                        !label.toLowerCase().includes("наложенный платеж"),
                    )
                    .reduce((acc, { price }) => acc + price, 0) ?? 0)}{" "}
                ₽
              </div>
            )}
            {error && error.response && error.response.status === 404 && (
              <div className="flex py-2 text-3xl text-center justify-center items-center bg-primary text-primary-foreground rounded-md font-bold">
                {error.response.data.message}
              </div>
            )}
          </div>
        </div>
      </form>
    );
  },
});
