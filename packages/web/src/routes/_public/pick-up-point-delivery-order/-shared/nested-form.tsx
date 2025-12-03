import { withForm } from "@/hooks/form";
import { defaultPickUpPointDeliveryOrderOpts } from "@/routes/_public/pick-up-point-delivery-order/-shared/shared-form";
import { Suspend } from "@/components/suspend";
import z from "zod";
import { cn, getEmailErrorMessage } from "@/lib/utils";
import { useDeliveryCompaniesQuery } from "@/features/delivery-company/queries";
import { usePointPostQuery } from "@/features/point/queries";
import { Toggle } from "@/components/ui/toggle";
import { useAdditionalServicePickUpQuery } from "@/features/additional-service/queries";
import { Fragment, useEffect, useState } from "react";
import { FormItem } from "@/components/ui/form";
import {
  ChevronDown,
  ChevronUp,
  CircleAlertIcon,
  TriangleAlert,
} from "lucide-react";
import {
  Button,
  Callout,
  Card,
  IconButton,
  Popover,
  Separator,
  Spinner,
  Text,
  TextField,
} from "@radix-ui/themes";
import { TypographyH3 } from "@/components/typography/typographyH3";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { useStore } from "@tanstack/react-form";
import { useBlocker } from "@tanstack/react-router";
import * as AutoDismissMessage from "@/components/ui/auto-dismiss-message";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TypographyH2 } from "@/components/typography/typographyH2";
import { HighlightText } from "@/components/typography/highlight-text";
import { useCalculateGlobalQuery } from "@/features/delivery-rate/queries";
import type { CalculateGlobalParams } from "@/features/delivery-rate/types";
import { keepPreviousData } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { sonner } from "@/components/ui/toast";

const emailSchema = z.email({ pattern: z.regexes.email });

export const PickUpPointDeliveryOrderForm = withForm({
  ...defaultPickUpPointDeliveryOrderOpts,
  render: function Render({ form }) {
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

    const [calculateParams, setCalculateParams] =
      useState<CalculateGlobalParams>();
    const {
      data: calculateDeliveryResult,
      isLoading,
      isPlaceholderData,
      isError,
      error,
    } = useCalculateGlobalQuery({
      params: calculateParams,
      options: {
        enabled: !!calculateParams,
        placeholderData: keepPreviousData,
      },
    });

    const handleCalculation = () => {
      const pointFrom = Number.parseInt(form.state.values.sender.pointFrom, 10);
      const pointTo = Number.parseInt(form.state.values.recipient.pointTo, 10);
      const deliveryCompany = Number.parseInt(
        form.state.values.recipient.deliveryCompany,
        10,
      );
      const { totalWeight, cubicMeter } = form.state.values.cargoData;

      setCalculateParams({
        weight: totalWeight,
        cubicMeter: cubicMeter,
        pointFrom,
        pointTo,
        deliveryCompany,
        isHomeDelivery: false,
        deliveryType: 3,
        deliveryRateGroup: 4,
      });
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

    const { open, message, setOpen, setMessage, variant, setVariant } =
      AutoDismissMessage.useAutoDismiss();

    const styles = getComputedStyle(document.documentElement);
    const smBreakpoint = styles.getPropertyValue("--breakpoint-sm");

    const isMobile = useMediaQuery(`(max-width: ${smBreakpoint})`);

    useEffect(() => {
      if (isError) {
        if (isAxiosError(error)) {
          if (error.response) {
            const status = error.response.status;
            const errors = error.response?.data.message[0] as unknown as Record<
              string,
              string
            >;

            const russianFieldNames: Record<string, string> = {
              pointFrom: "Населенный пункт отправителя должен быть заполнен!",
              pointTo: "Населенный пункт получателя должен быть заполнен!",
              deliveryCompany: "Транспортная компания должна быть заполнена!",
            };

            if (status === 400) {
              form.setErrorMap({
                onChange: {
                  fields: {
                    "sender.pointFrom":
                      errors["pointFrom"] && russianFieldNames["pointFrom"],
                    "recipient.pointTo":
                      errors["pointTo"] && russianFieldNames["pointTo"],
                    "recipient.deliveryCompany":
                      errors["deliveryCompany"] &&
                      russianFieldNames["deliveryCompany"],
                  },
                },
              });

              const messages = [];
              for (const errorName in errors) {
                const message = russianFieldNames[errorName];
                messages.push(`${message}`);
              }

              sonner({
                title: "Просчёт стоимости",
                description: messages.map((message) => (
                  <Text
                    key={message}
                    as="p"
                    size="1"
                    className="text-accent-11 mt-1"
                  >
                    {message}
                  </Text>
                )),
                button: {
                  label: "Понятно",
                },
              });
            }
          }
        }
      }
    }, [form, isError, error]);

    return (
      <>
        <div className="xs:h-2 h-4 shrink-0" />
        <TypographyH2>
          Online заявка <HighlightText>на забор груза</HighlightText> в ЛДНР и
          Запорожье
        </TypographyH2>
        <Card my="2" size={isMobile ? "2" : "3"}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit({ setMessage, setOpen, setVariant });
            }}
          >
            <AutoDismissMessage.Root
              variant={variant}
              open={open}
              onOpenChange={setOpen}
              durationMs={60_000}
            >
              <AutoDismissMessage.Container>
                <AutoDismissMessage.Title>
                  Регистрация успешно проведена!
                </AutoDismissMessage.Title>
                <AutoDismissMessage.Content>
                  {message}
                </AutoDismissMessage.Content>
                <AutoDismissMessage.Close />
              </AutoDismissMessage.Container>
            </AutoDismissMessage.Root>
            <TypographyH3>Отправитель</TypographyH3>
            <form.AppField
              name="sender.type"
              validators={{
                onChange: ({ value: type }) => {
                  if (!type) {
                    return "Выберите один из вариантов";
                  }
                  return undefined;
                },
              }}
              children={(field) => {
                return (
                  <field.RadioGroupField
                    options={[
                      { label: "Физ лицо", value: "individual" },
                      { label: "Компания", value: "company" },
                    ]}
                    ariaLabel="Выберите физ. лицо отправителя или компания отправителя"
                  />
                );
              }}
            />

            <form.Subscribe
              selector={(state) => state.values.sender.type}
              children={(senderType) => {
                if (senderType !== "individual") return null;
                return (
                  <Suspend>
                    <div className="my-2 grid grid-cols-1 gap-2 rounded-l-xs py-2 sm:ml-1 sm:grid-cols-2 sm:pl-2">
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
                              placeholder="Иван"
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
                              rightElement={
                                <TextField.Slot side="right">
                                  <Popover.Root>
                                    <Popover.Trigger>
                                      <IconButton
                                        color="gray"
                                        type="button"
                                        className="[&_svg]:size-3.5"
                                        size="2"
                                        variant="ghost"
                                      >
                                        <CircleAlertIcon />
                                      </IconButton>
                                    </Popover.Trigger>
                                    <Popover.Content
                                      align="end"
                                      side="bottom"
                                      size="1"
                                    >
                                      <Text size="1" as="p" trim="both">
                                        Забор груза отправителя
                                      </Text>
                                    </Popover.Content>
                                  </Popover.Root>
                                </TextField.Slot>
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
                    <div className="my-2 grid grid-cols-1 gap-2 py-2 sm:ml-1 sm:grid-cols-2 sm:pl-2 md:grid-cols-2">
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
                                const isNotDigit = /[^0-9]/.test(
                                  e.target.value,
                                );
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

            <Separator size="2" className="sm:my-rx-4 my-rx-3 mx-auto" />

            <TypographyH3>Получатель</TypographyH3>
            <form.AppField
              name="recipient.type"
              validators={{
                onChange: ({ value: type }) => {
                  if (!type) {
                    return "Выберите один из вариантов";
                  }
                  return undefined;
                },
              }}
              children={(field) => {
                return (
                  <field.RadioGroupField
                    options={[
                      { label: "Физ лицо", value: "individual" },
                      { label: "Компания", value: "company" },
                    ]}
                    ariaLabel="Выберите физ. лицо получателя или компанию получателя"
                  />
                );
              }}
            />

            <form.Subscribe
              selector={(state) => state.values.recipient.type}
              children={(recipientType) => {
                if (recipientType !== "individual") return null;
                return (
                  <Suspend>
                    <div className="my-2 grid grid-cols-1 gap-2 py-2 sm:ml-1 sm:grid-cols-2 sm:pl-2 md:grid-cols-2">
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
                              placeholder="Иван"
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
                        validators={{
                          onChange: () => {
                            return undefined;
                          },
                        }}
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
                    <div className="my-2 grid grid-cols-1 gap-2 py-2 sm:ml-1 sm:grid-cols-2 sm:pl-2 md:grid-cols-2">
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
                                const isNotDigit = /[^0-9]/.test(
                                  e.target.value,
                                );
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
                          onChange: () => {
                            return undefined;
                          },
                        }}
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
                    </div>
                  </Suspend>
                );
              }}
            />

            <Separator size="2" className="sm:my-rx-4 my-rx-3 mx-auto" />

            <form.AppField
              name="customer.isToggled"
              children={(field) => {
                return (
                  <Fragment>
                    <TypographyH3>Заказчик</TypographyH3>
                    <Toggle
                      className={cn(
                        "data-[state=on]:bg-accentA-5 data-[state=on]:text-accentA-11 data-[state=on]:active:bg-accentA-3 data-[state=on]:-mb-px data-[state=on]:[box-shadow:inset_0_0_0_1px_var(--accent-a7)] data-[state=on]:active:[box-shadow:inset_0_0_0_1px_var(--accent-a6)] max-sm:data-[state=on]:rounded-sm max-sm:data-[state=on]:rounded-br-none max-sm:data-[state=on]:rounded-bl-none sm:data-[state=on]:mb-0",
                      )}
                      pressed={field.state.value}
                      onPressedChange={field.handleChange}
                    >
                      <span className="min-w-0 flex-1 flex-shrink truncate">
                        Заказчик(по выбору клиента)
                      </span>
                      {field.state.value ? <ChevronDown /> : <ChevronUp />}
                    </Toggle>
                  </Fragment>
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
                            "rounded-tl-xs sm:ml-1 sm:pt-2 sm:pl-2",

                            // mobile view
                            "sm:mt-2 [&_button]:first-of-type:rounded-l-sm [&_button]:first-of-type:rounded-tl-none [&_button]:last-of-type:mr-0 [&_button]:last-of-type:rounded-r-sm [&_button]:last-of-type:rounded-tr-none [&_span]:group-first-of-type:rounded-l-sm [&_span]:group-first-of-type:rounded-tl-none [&_span]:group-last-of-type:rounded-r-sm [&_span]:group-last-of-type:rounded-tr-none",

                            // desktop view
                            "sm:[&_button]:first-of-type:rounded-l-full sm:[&_button]:last-of-type:-mr-px sm:[&_button]:last-of-type:rounded-r-full sm:[&_span]:group-first-of-type:rounded-l-full sm:[&_span]:group-last-of-type:rounded-r-full",
                          )}
                        >
                          <field.RadioGroupField
                            options={[
                              { label: "Физ лицо", value: "individual" },
                              { label: "Компания", value: "company" },
                            ]}
                            ariaLabel="Выберите один из вариантов"
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
                    <div className="mb-4 grid grid-cols-1 gap-2 rounded-bl-xs pt-2 sm:ml-1 sm:grid-cols-2 sm:pl-2 md:grid-cols-2">
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
                    <div className="mb-4 grid grid-cols-1 gap-2 rounded-bl-xs pt-2 sm:ml-1 sm:grid-cols-2 sm:pl-2 md:grid-cols-2">
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
                                const isNotDigit = /[^0-9]/.test(
                                  e.target.value,
                                );

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

            <Separator size="2" className="sm:my-rx-4 my-rx-3 mx-auto" />

            <TypographyH3>Данные о грузе</TypographyH3>
            <div className="mt-2 mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-2">
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
                      rightElement={
                        <TextField.Slot side="right">
                          <Popover.Root>
                            <Popover.Trigger>
                              <IconButton
                                color="gray"
                                type="button"
                                className="[&_svg]:size-3.5"
                                size="2"
                                variant="ghost"
                              >
                                <CircleAlertIcon />
                              </IconButton>
                            </Popover.Trigger>
                            <Popover.Content
                              align="end"
                              side="bottom"
                              size="1"
                              maxWidth="300px"
                            >
                              <Text size="1" as="p" trim="both">
                                Если не знаете объем груза, заполните габариты
                                ниже (длина, ширина, высота)
                              </Text>
                            </Popover.Content>
                          </Popover.Root>
                        </TextField.Slot>
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
                      color="orange"
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
                      color="orange"
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
                      color="orange"
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

            <Callout.Root
              size="1"
              variant="soft"
              color="orange"
              className="mb-3 items-center justify-between p-2 [&_svg]:size-4 [&_svg]:shrink-0"
            >
              <div className="flex items-center gap-2">
                <Callout.Icon className="self-start">
                  <TriangleAlert />
                </Callout.Icon>
                <div className="flex min-w-0 items-center gap-2">
                  <Callout.Text wrap="balance" className="leading-rx-4">
                    Габариты указываются по самой большой позиции груза
                  </Callout.Text>
                </div>
              </div>
              <Popover.Root>
                <Popover.Trigger>
                  <IconButton
                    className="col-start-2 ml-auto [&>svg]:size-3.5"
                    color="orange"
                    variant="ghost"
                    size="1"
                  >
                    <CircleAlertIcon />
                  </IconButton>
                </Popover.Trigger>
                <Popover.Content
                  size="1"
                  maxWidth="300px"
                  align="end"
                  side="bottom"
                >
                  <Text color="orange" highContrast as="p" trim="both" size="1">
                    Если у вас несколько коробок разного размера, нужно указать
                    размеры самой большой из них.
                  </Text>
                </Popover.Content>
              </Popover.Root>
            </Callout.Root>
            {/* <div className="text-orangeA-11 inline-flex w-full items-center justify-center gap-2 text-sm leading-none [&_svg]:size-4.5 [&_svg]:shrink-0 [&_svg]:self-start"> */}
            {/*   <TriangleAlert /> */}
            {/*   <Text className="leading-rx-4" as="p"> */}
            {/*     Габариты указываются по самой большой позиции груза */}
            {/*   </Text> */}
            {/* </div> */}

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

            <Separator size="2" className="sm:my-rx-4 my-rx-3 mx-auto" />

            {isAdditionalServiceLoading && (
              <div className="text-accentA-11 flex items-center justify-center gap-2 py-1.5">
                <Spinner />
                Загружаем доп. услуги
              </div>
            )}
            {(additionalServices === null ||
              additionalServices === undefined ||
              additionalServices?.length === 0) &&
              !isAdditionalServiceLoading && (
                <div className="text-gray-12 flex w-full flex-col items-center justify-center gap-2 py-2">
                  Не удалось загрузить дополнительные услуги
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      refetchAdditionalServices();
                    }}
                    size="2"
                    radius="full"
                    variant="outline"
                  >
                    Попробовать еще раз
                  </Button>
                </div>
              )}

            {additionalServices &&
              additionalServices.length !== 0 &&
              !isAdditionalServiceLoading && (
                <form.AppField
                  name="additionalService"
                  mode="array"
                  children={(field) => {
                    return (
                      <Fragment>
                        <TypographyH3>Дополнительные услуги</TypographyH3>
                        <div className="border-accentA-6 flex flex-col flex-wrap gap-x-4 gap-y-2 rounded-sm pt-3 pb-3 sm:flex-row sm:rounded-l-none sm:pt-4">
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
                                    <FormItem className="flex-1 items-stretch gap-y-1 sm:gap-y-1">
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
                                              <>
                                                <field.NumericField
                                                  size={isMobile ? "2" : "1"}
                                                  shouldFocusOnMount
                                                  placeholder="Наложенный платеж в рублях"
                                                  thousandSeparator=" "
                                                  suffix=" ₽"
                                                />
                                              </>
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
              )}

            <Separator size="2" className="sm:my-rx-4 my-rx-3 mx-auto" />

            <TypographyH3 className="text-primary">Оплата</TypographyH3>
            <div className="mb-rx-6 mt-2 flex flex-col gap-x-4 gap-y-2 sm:grid sm:grid-cols-2">
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

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-2">
              <form.AppForm>
                <form.SubmitButton
                  loadingMessage="Оформляем заявку"
                  label="Оформить заявку"
                />
              </form.AppForm>
              <div className="flex flex-col gap-1.5">
                <Button
                  variant="classic"
                  disabled={isLoading || isPlaceholderData}
                  type="button"
                  onClick={handleCalculation}
                >
                  {isLoading || isPlaceholderData ? (
                    <>
                      <Spinner />
                      Просчитываем...
                    </>
                  ) : (
                    <>Узнать примерную стоимость</>
                  )}
                </Button>
                {calculateDeliveryResult && !isError && (
                  <div
                    className={cn(
                      "bg-accentA-3 text-accentA-11 flex items-center justify-center rounded-md py-2 text-3xl font-bold",
                      isPlaceholderData &&
                        "animate-[pulse_1.5s_cubic-bezier(0.4,_0,_0.6,_1)_infinite] opacity-70",
                    )}
                  >
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
                  <div className="bg-accentA-3 text-accentA-11 flex items-center justify-center rounded-md py-2 text-center text-3xl font-bold">
                    {error.response.data.message}
                  </div>
                )}
              </div>
            </div>
          </form>
        </Card>
      </>
    );
  },
});
