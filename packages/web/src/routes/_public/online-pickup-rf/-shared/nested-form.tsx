import { withForm } from "@/hooks/form";
import { defaultOnlinePickupRFOpts } from "./shared-form";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import {
  Callout,
  Card,
  IconButton,
  Popover,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TypographyH2 } from "@/components/typography/typographyH2";
import { HighlightText } from "@/components/typography/highlight-text";
import { TypographyH3 } from "@/components/typography/typographyH3";
import {
  ChevronDown,
  ChevronUp,
  CircleAlertIcon,
  TriangleAlert,
} from "lucide-react";
import { cn, getEmailErrorMessage, validatePickupTime } from "@/lib/utils";
import z from "zod";
import { Fragment } from "react/jsx-runtime";
import { Toggle } from "@/components/ui/toggle";
import { usePointPostQuery } from "@/features/point/queries";
import { FieldGroupAcceptedField } from "@/components/forms/field-groups/accepted-field";

const emailSchema = z.email({ pattern: z.regexes.email });

export const OnlinePickupRFForm = withForm({
  ...defaultOnlinePickupRFOpts,
  render: function Render({ form }) {
    const styles = getComputedStyle(document.documentElement);
    const smBreakpoint = styles.getPropertyValue("--breakpoint-sm");

    const isMobile = useMediaQuery(`(max-width: ${smBreakpoint})`);

    const {
      data: points,
      isLoading: isPointsLoading,
      refetch: refetchPoints,
    } = usePointPostQuery();

    return (
      <>
        <div className="xs:h-2 h-4 shrink-0" />
        <TypographyH2>
          ОНЛАЙН-ЗАЯВКА <HighlightText>на забор по РФ</HighlightText>
        </TypographyH2>
        <Card my="2" size={isMobile ? "2" : "3"}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <TypographyH3 className="sm:mb-1">
              Отправитель(у кого забрать груз)
            </TypographyH3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-2">
              <form.AppField
                name="surnameSender"
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
                      ariaLabel="Заполните фамилию отправителя"
                      placeholder="Иванов"
                    />
                  );
                }}
              />
              <form.AppField
                name="nameSender"
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
                      ariaLabel="Заполните имя отправителя"
                      placeholder="Иван"
                    />
                  );
                }}
              />
              <form.AppField
                name="patronymicSender"
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
                      ariaLabel="Заполните отчество отправителя"
                      placeholder="Иванович"
                    />
                  );
                }}
              />

              <form.AppField
                name="phoneSender"
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
                        ariaLabel="Заполните телефон отправителя/у кого забрать груз"
                        placeholder="Заполните телефон"
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
                                  Если телефон не отвечает, забор не
                                  производиться
                                </Text>
                              </Popover.Content>
                            </Popover.Root>
                          </TextField.Slot>
                        }
                      />
                      <div className="flex flex-wrap justify-center gap-2">
                        <form.AppField
                          name="telegramSender"
                          children={(field) => {
                            return (
                              <field.CheckboxField
                                className="self-center"
                                label="Telegram"
                                ariaLabel="Заполните телеграм отправителя"
                              />
                            );
                          }}
                        />
                        <form.AppField
                          name="whatsAppSender"
                          children={(field) => {
                            return (
                              <field.CheckboxField
                                className="self-center"
                                label="MAX"
                                ariaLabel="Заполните MAX-мессенджер отправителя"
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
                name="cityRegion"
                validators={{
                  onChange: ({ value }) => {
                    if (!value.length) {
                      return "Город и область обязательно";
                    }
                    if (value.length < 3 || value.length > 50) {
                      return "Город и область не должно быть короче 3 символов и длиннее 50";
                    }
                    return undefined;
                  },
                }}
                children={(field) => {
                  return (
                    <field.TextField
                      label="Город и область для забора"
                      ariaLabel="Заполните город и область для забора"
                      placeholder="Город и область"
                    />
                  );
                }}
              />

              <form.AppField
                name="pickupAddress"
                validators={{
                  onChange: ({ value }) => {
                    if (!value.length) {
                      return "Заполните адрес забора";
                    }
                    if (value.length < 3 || value.length > 50) {
                      return "Адрес забора не должен быть короче 3 символов и длиннее 50";
                    }
                    return undefined;
                  },
                }}
                children={(field) => {
                  return (
                    <field.TextField
                      label="Адрес забора(улица, дом, корпус, подъезд, квартира)"
                      ariaLabel="Заполните адрес забора(улица, дом, корпус, подъезд, квартира)"
                      placeholder="Улица, дом, корпус, подъезд, квартира"
                    />
                  );
                }}
              />

              {/* the value is number */}
              <form.AppField
                name="pickupTime"
                validators={{
                  onSubmit: ({ value }) => {
                    if (!/\d/.test(value)) {
                      return "Заполните поле!";
                    }

                    return validatePickupTime(value);
                  },
                }}
                children={(field) => {
                  return (
                    <field.PatternField
                      allowEmptyFormatting
                      mask="*"
                      isAllowed={(values) => {
                        const formattedValue = values.formattedValue;

                        // Match pattern: с ЧЧ:ММ до ЧЧ:ММ
                        const match = formattedValue.match(
                          /с\s*(\d{0,2}):?(\d{0,2})\s*(?:до\s*(\d{0,2}):?(\d{0,2}))?/,
                        );

                        if (!match) return true; // Allow if pattern doesn't match yet (user is typing)

                        const [, startHour, startMinute, endHour, endMinute] =
                          match;

                        // Validate start hour (first digit must be 0-2, if 2 then second digit must be 0-3)
                        if (startHour) {
                          const hour = parseInt(startHour);
                          if (startHour.length === 1) {
                            if (hour > 2) return false;
                          } else if (startHour.length === 2) {
                            if (hour > 23) return false;
                          }
                        }

                        // Validate start minute (first digit must be 0-5)
                        if (startMinute) {
                          const minute = parseInt(startMinute);
                          if (startMinute.length === 1) {
                            if (minute > 5) return false;
                          } else if (startMinute.length === 2) {
                            if (minute > 59) return false;
                          }
                        }

                        // Validate end hour (first digit must be 0-2, if 2 then second digit must be 0-3)
                        if (endHour) {
                          const hour = parseInt(endHour);
                          if (endHour.length === 1) {
                            if (hour > 2) return false;
                          } else if (endHour.length === 2) {
                            if (hour > 23) return false;
                          }
                        }

                        // Validate end minute (first digit must be 0-5)
                        if (endMinute) {
                          const minute = parseInt(endMinute);
                          if (endMinute.length === 1) {
                            if (minute > 5) return false;
                          } else if (endMinute.length === 2) {
                            if (minute > 59) return false;
                          }
                        }

                        return true;
                      }}
                      format="с ##:## до ##:##"
                      label="Время забора груза(промежуток времени не менее 2-х часов)"
                      ariaLabel="Заполните время забора груза(промежуток времени не менее 2-х часов)"
                      placeholder="Промежуток времени не менее 2-х часов"
                    />
                  );
                }}
              />
            </div>

            <Separator size="2" className="sm:my-rx-4 my-rx-3 mx-auto" />
            <TypographyH3 className="sm:mb-1">Данные о грузе</TypographyH3>

            <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-2">
              <form.AppField
                name="totalWeight"
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
                      ariaLabel="Заполните общий вес груза/посылки в килограммах"
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
                name="cubicMeter"
                listeners={{
                  onChange: ({ value }) => {
                    const { long, width, height } = form.state.values;
                    const hasAllFilled = !!(long && width && height);
                    if (value <= 0 && hasAllFilled) {
                      form.setFieldValue("long", 0);
                      form.setFieldValue("width", 0);
                      form.setFieldValue("height", 0);
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
                    form.getFieldValue("width") &&
                    form.getFieldValue("long") &&
                    form.getFieldValue("height")
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
                name="width"
                listeners={{
                  onChange: ({ value: width }) => {
                    const { long, height } = form.state.values;
                    form.setFieldValue(
                      "cubicMeter",
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
                name="height"
                listeners={{
                  onChange: ({ value: height }) => {
                    const { long, width } = form.state.values;
                    form.setFieldValue(
                      "cubicMeter",
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
                name="long"
                listeners={{
                  onChange: ({ value: long }) => {
                    const { width, height } = form.state.values;
                    form.setFieldValue(
                      "cubicMeter",
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

            <form.AppField
              name="description"
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
            <TypographyH3 className="sm:mb-1">Получатель</TypographyH3>

            <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-2">
              <form.AppField
                name="surnameRecipient"
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
                      ariaLabel="Заполните фамилию отправителя получателя"
                    />
                  );
                }}
              />
              <form.AppField
                name="nameRecipient"
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
                      ariaLabel="Заполните имя отправителя получателя"
                      placeholder="Иван"
                    />
                  );
                }}
              />
              <form.AppField
                name="patronymicRecipient"
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
                      ariaLabel="Заполните отчество отправителя получателя"
                      placeholder="Иванович"
                    />
                  );
                }}
              />
              <form.AppField
                name="phoneRecipient"
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
                        ariaLabel="Заполните телефон отправителя получателя"
                        placeholder="Заполните телефон"
                      />
                      <div className="flex flex-wrap justify-center gap-2">
                        <form.AppField
                          name="telegramRecipient"
                          children={(field) => {
                            return (
                              <field.CheckboxField
                                className="self-center"
                                label="Telegram"
                                ariaLabel="Заполните телеграм отправителя получателя"
                              />
                            );
                          }}
                        />
                        <form.AppField
                          name="whatsAppRecipient"
                          children={(field) => {
                            return (
                              <field.CheckboxField
                                className="self-center"
                                label="MAX"
                                ariaLabel="Заполните ватсап отправителя получателя"
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
                name="emailRecipient"
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
            </div>

            <form.AppField
              name="deliveryRecipientType"
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
                  <div className="flex flex-col">
                    <field.RadioGroupField
                      label="Выберите"
                      options={[
                        { label: "Пункт выдачи", value: "pointTo" },
                        {
                          label: "Адресная доставка",
                          value: "pickupAddress",
                        },
                      ]}
                      ariaLabel="Выберите способ доставки для получателя"
                    />
                    <div className="mt-2">
                      <form.Subscribe
                        selector={(state) => state.values.deliveryRecipientType}
                        children={(deliveryRecipientType) => {
                          if (deliveryRecipientType !== "pointTo") return null;
                          return (
                            <form.AppField
                              name="pointTo"
                              validators={{
                                onChange: ({ value }) => {
                                  if (
                                    typeof value === "string" &&
                                    !value.length
                                  ) {
                                    return "Выберите населенный пункт";
                                  }
                                  return undefined;
                                },
                              }}
                              children={(field) => {
                                return (
                                  <field.ComboboxField
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
                          );
                        }}
                      />

                      <form.Subscribe
                        selector={(state) => state.values.deliveryRecipientType}
                        children={(deliveryRecipientType) => {
                          if (deliveryRecipientType !== "pickupAddress")
                            return null;
                          return (
                            <form.AppField
                              name="pickupAddressRecipient"
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
                                    placeholder="Город, улица, дом, корпус, подъезд, квартира"
                                    aria-label="Запишите адрес получателя"
                                  />
                                );
                              }}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                );
              }}
            />

            <Separator size="2" className="sm:my-rx-4 my-rx-3 mx-auto" />
            <TypographyH3 className="text-primary">Оплата</TypographyH3>

            <div className="mb-rx-6 mt-2 flex flex-col gap-x-4 gap-y-2 sm:grid sm:grid-cols-2">
              <form.AppField
                name="shippingPayment"
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
                          label: "Кто оплачивает",
                          items: [
                            { label: "Отправитель", value: "Отправитель" },
                            { label: "Получатель", value: "Получатель" },
                            { label: "Третье лицо", value: "Третье лицо" },
                          ],
                        },
                      ]}
                      label="Кто оплачивает"
                      placeholder="Выберите плательщика..."
                    />
                  );
                }}
              />
            </div>

            <Separator size="2" className="sm:my-rx-4 my-rx-3 mx-auto" />

            <form.AppField
              name="customerIsToggled"
              children={(field) => {
                return (
                  <Fragment>
                    <TypographyH3>Заказчик</TypographyH3>
                    <Toggle
                      className={cn(
                        "data-[state=on]:bg-accentA-5 data-[state=on]:text-accentA-11 data-[state=on]:active:bg-accentA-3 mb-4 data-[state=on]:-mb-px data-[state=on]:[box-shadow:inset_0_0_0_1px_var(--accent-a7)] data-[state=on]:active:[box-shadow:inset_0_0_0_1px_var(--accent-a6)] max-sm:data-[state=on]:rounded-sm max-sm:data-[state=on]:rounded-br-none max-sm:data-[state=on]:rounded-bl-none sm:data-[state=on]:mb-0",
                      )}
                      pressed={field.state.value}
                      onPressedChange={field.handleChange}
                    >
                      <span className="min-w-0 flex-1 flex-shrink truncate">
                        Третье лицо-Заказчик(ПРИ НАЛИЧИИ)
                      </span>
                      {field.state.value ? <ChevronDown /> : <ChevronUp />}
                    </Toggle>
                  </Fragment>
                );
              }}
            />

            <form.Subscribe
              selector={(state) => state.values.customerIsToggled}
              children={(customerIsToggled) => {
                if (!customerIsToggled) return null;
                return (
                  <div className="mb-4 grid grid-cols-1 gap-2 rounded-bl-xs pt-2 sm:ml-1 sm:grid-cols-2 sm:pl-2 md:grid-cols-2">
                    <form.AppField
                      name="surnameCustomer"
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
                            ariaLabel="Заполните фамилию заказчика"
                            placeholder="Иванов"
                          />
                        );
                      }}
                    />
                    <form.AppField
                      name="nameCustomer"
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
                            ariaLabel="Заполните имя заказчика"
                            placeholder="Иван"
                          />
                        );
                      }}
                    />

                    <form.AppField
                      name="patronymicCustomer"
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
                            ariaLabel="Заполните отчество заказчика"
                            placeholder="Иванович"
                          />
                        );
                      }}
                    />

                    <form.AppField
                      name="phoneSender"
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
                              ariaLabel="Заполните телефон отправителя/у кого забрать груз"
                              placeholder="Заполните телефон"
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
                                        Если телефон не отвечает, забор не
                                        производиться
                                      </Text>
                                    </Popover.Content>
                                  </Popover.Root>
                                </TextField.Slot>
                              }
                            />
                          </div>
                        );
                      }}
                    />
                  </div>
                );
              }}
            />

            <FieldGroupAcceptedField
              form={form}
              fields={{ accepted: "accepted" }}
            />

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-2">
              <form.AppForm>
                <form.SubmitButton
                  loadingMessage="Оформляем заявку"
                  label="Оформить заявку на забор"
                />
              </form.AppForm>
            </div>
          </form>
        </Card>
      </>
    );
  },
});
