import { withForm } from "@/hooks/form";
import { defaultShopCostCalculationOrderOpts } from "@/features/shop-cost-calculation-order/shared-form";
import React, { useState } from "react";
import { Button, Heading, Tooltip } from "@radix-ui/themes";
import { z } from "zod";
import { getEmailErrorMessage } from "@/lib/utils";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { usePointPostQuery } from "@/features/point/queries";
import { PackagePlus, Store, X } from "lucide-react";
import { AccessibleIcon } from "@radix-ui/themes";
import {
  AutoDismissMessage,
  type AutoDimissMessageProps,
} from "@/components/auto-dismiss-message";
import { useBlocker } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-form";
import { TypographyH2 } from "@/components/typography/typographyH2";
import { HighlightText } from "@/components/typography/highlight-text";

// https://colinhacks.com/essays/reasonable-email-regex
// Исходный regex из Zod:
// /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_'+\-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i;
const emailSchema = z.email({ pattern: z.regexes.email });
const linkSchema = z.url();

export const ShopCostCalculationOrderForm = withForm({
  ...defaultShopCostCalculationOrderOpts,
  render: function ({ form }) {
    const {
      data: values,
      isLoading,
      refetch: refetchPoints,
    } = usePointPostQuery();

    const [message, setMessage] = useState<AutoDimissMessageProps>({
      title: "Регистрация успешно проведена!",
      variant: "success",
      onClose: () => setMessage((prev) => ({ ...prev, isOpen: false })),
      isOpen: false,
      durationMs: 60_000,
    });

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

    return (
      <div className="mx-auto w-full max-w-2xl">
        <TypographyH2 className="text-start sm:text-center pb-3">
          Оформление заявки на просчет стоимости на{" "}
          <HighlightText>выкуп заказов</HighlightText>
        </TypographyH2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit({ onSubmit: setMessage });
          }}
        >
          <AutoDismissMessage {...message} />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 sm:gap-3">
            {/* Получатель */}
            <form.AppField
              name="shopCostCalculationOrder.surname"
              validators={{
                onChange: ({ value }) => {
                  if (!value.length) {
                    return "Фамилия обязательна";
                  }
                  if (value.length < 5 || value.length > 50) {
                    return "Фамилия не должна быть короче 5 символов и длиннее 50";
                  }
                  return undefined;
                },
              }}
              children={(field) => (
                <field.TextField label="Фамилия" placeholder="Иванов" />
              )}
            />
            <form.AppField
              name="shopCostCalculationOrder.name"
              validators={{
                onChange: ({ value }) => {
                  if (!value.length) {
                    return "Имя обязательно";
                  }
                  if (value.length < 2 || value.length > 50) {
                    return "Имя не должно быть короче 2 символов и длиннее 50";
                  }
                  return undefined;
                },
              }}
              children={(field) => (
                <field.TextField label="Имя" placeholder="Иван" />
              )}
            />
            <form.AppField
              name="shopCostCalculationOrder.patronymic"
              validators={{
                onChange: ({ value }) => {
                  if (!value.length) {
                    return "Отчество обязательно";
                  }
                  if (value.length < 5 || value.length > 50) {
                    return "Отчество не должно быть короче 5 символов и длиннее 50";
                  }
                  return undefined;
                },
              }}
              children={(field) => (
                <field.TextField label="Отчество" placeholder="Иванович" />
              )}
            />
            <form.AppField
              name="shopCostCalculationOrder.email"
              validators={{
                onChange: ({ value }) => {
                  const result = emailSchema.safeParse(value);

                  if (result.error) {
                    return getEmailErrorMessage(value);
                  }

                  return undefined;
                },
              }}
              children={(field) => (
                <field.TextField
                  type="email"
                  label="E-mail"
                  placeholder="example@mail.ru"
                />
              )}
            />
            <form.AppField
              name="shopCostCalculationOrder.phone"
              validators={{
                onChange: ({ value }) => {
                  return !isPossiblePhoneNumber(value)
                    ? "Проверьте правильно ли ввели номер телефона"
                    : undefined;
                },
              }}
              children={(phoneField) => (
                <phoneField.PhoneField
                  label={"Телефон"}
                  placeholder="Заполните номер телефона"
                  // country={"RU"}
                  // international
                  // withCountryCallingCode
                  // labels={ru}
                />
              )}
            />
          </div>

          {/* Пункт выдачи*/}
          <div className="my-4">
            <form.AppField
              name="shopCostCalculationOrder.pointTo"
              validators={{
                onChange: ({ value }) => {
                  if (typeof value === "string" && !value.length) {
                    return "Выберите пункт выдачи";
                  }
                  return undefined;
                },
              }}
              children={(pointToField) => {
                return (
                  <pointToField.ComboboxField
                    label="Пункт выдачи"
                    placeholder="Выберите пункт выдачи"
                    loadingMessage="Загружаем отделения"
                    ariaLabel="Выбрать пункт выдачи из списка"
                    searchEmptyMessage="Таких отделений нет"
                    searchInputPlaceholder="Найти отделение..."
                    refetch={refetchPoints}
                    isLoading={isLoading}
                    values={values}
                  />
                );
              }}
            />
          </div>

          {/* Заказ */}
          <form.AppField
            name="shopCostCalculationOrderPosition"
            mode="array"
            children={(shopsField) => {
              return (
                <div className="grid">
                  {shopsField.state.value.map((_, shopIndex) => {
                    return (
                      <React.Fragment key={shopIndex}>
                        {shopIndex !== 0 && (
                          <div className="flex justify-between items-center mt-2">
                            <Tooltip content="Удалить магазин и товары">
                              <button
                                className="text-redA-11 relative -bottom-1 ml-auto pointer-events-auto cursor-default shrink-0 inline-flex justify-center items-center size-6 rounded-full [&_svg]:size-3 hover:bg-redA-3 active:bg-redA-4 outline-none focus-visible:ring-red-8 focus-visible:ring-[2px]"
                                aria-label="Удалить магазин и товары"
                                type="button"
                                onClick={() =>
                                  shopsField.removeValue(shopIndex)
                                }
                              >
                                <AccessibleIcon label="Удалить магазин и товары">
                                  <X />
                                </AccessibleIcon>
                              </button>
                            </Tooltip>
                          </div>
                        )}
                        <form.AppField
                          key={shopIndex}
                          name={`shopCostCalculationOrderPosition[${shopIndex}].shop`}
                          validators={{
                            onSubmit: ({ value }) => {
                              if (!value.length) {
                                return "Магазин обязателен";
                              }
                              if (value.length < 2 || value.length > 50) {
                                return "Магазин не должен быть короче 2 символов и длиннее 50";
                              }
                              return undefined;
                            },
                          }}
                          children={(shopNameField) => (
                            <shopNameField.TextField
                              label={`Магазин № ${shopIndex + 1}`}
                              placeholder="Магазин(Ссылка|Название)"
                            />
                          )}
                        />

                        <form.Field
                          name={`shopCostCalculationOrderPosition[${shopIndex}].products`}
                          mode="array"
                          children={(productsField) => {
                            // Put Товар on the upper level
                            return (
                              <React.Fragment>
                                {productsField.state.value.map(
                                  (_, productIndex) => {
                                    return (
                                      <React.Fragment key={productIndex}>
                                        <div className="relative flex flex-col gap-1 mt-2 px-2 py-1 ml-1 border-l-3 border-red-6 rounded-s-xs bg-redA-1 [&_label]:text-red-12">
                                          {productIndex === 0 && (
                                            <Heading
                                              size="2"
                                              as="h3"
                                              className="font-medium text-red-12"
                                            >
                                              Товар № {productIndex + 1}
                                            </Heading>
                                          )}
                                          {productIndex !== 0 && (
                                            <div className="flex justify-between items-center mt-2">
                                              <Heading
                                                size="2"
                                                as="h3"
                                                className="font-medium text-red-12"
                                              >
                                                Товар № {productIndex + 1}
                                              </Heading>
                                              <Tooltip content="Удалить товар">
                                                <button
                                                  className="text-redA-11 relative -bottom-1 ml-auto pointer-events-auto cursor-default shrink-0 inline-flex justify-center items-center size-6 rounded-full [&_svg]:size-3 hover:bg-redA-3 active:bg-redA-4 outline-none focus-visible:ring-red-8 focus-visible:ring-[2px]"
                                                  aria-label="Удалить товар"
                                                  type="button"
                                                  onClick={() =>
                                                    productsField.removeValue(
                                                      productIndex,
                                                    )
                                                  }
                                                >
                                                  <AccessibleIcon label="Удалить товар">
                                                    <X />
                                                  </AccessibleIcon>
                                                </button>
                                              </Tooltip>
                                            </div>
                                          )}

                                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2">
                                            <form.AppField
                                              name={`shopCostCalculationOrderPosition[${shopIndex}].products[${productIndex}].link`}
                                              validators={{
                                                onSubmit: ({ value }) => {
                                                  if (!value.length) {
                                                    return "Ссылка обязательна";
                                                  }

                                                  if (
                                                    value.length < 8 ||
                                                    value.length > 255
                                                  ) {
                                                    return "Ссылка не должна быть короче 8 символов и длиннее 255";
                                                  }

                                                  const result =
                                                    linkSchema.safeParse(value);

                                                  if (result.error) {
                                                    return "Неверный формат ссылки";
                                                  }

                                                  return undefined;
                                                },
                                              }}
                                              children={(linkField) => (
                                                <linkField.TextField
                                                  label="Ссылка"
                                                  placeholder="Ссылка"
                                                />
                                              )}
                                            />

                                            <form.AppField
                                              name={`shopCostCalculationOrderPosition[${shopIndex}].products[${productIndex}].description`}
                                              validators={{
                                                onSubmit: ({ value }) => {
                                                  if (!value.length) {
                                                    return "Описание обязательно";
                                                  }
                                                  if (
                                                    value.length < 8 ||
                                                    value.length > 255
                                                  ) {
                                                    return "Описание не должен быть короче 8 символов и длиннее 255";
                                                  }
                                                  return undefined;
                                                },
                                              }}
                                              children={(descriptionField) => (
                                                <descriptionField.TextField
                                                  label="Описание"
                                                  placeholder="Размер, цвет и так далее"
                                                />
                                              )}
                                            />

                                            <form.AppField
                                              name={`shopCostCalculationOrderPosition[${shopIndex}].products[${productIndex}].price`}
                                              validators={{
                                                onSubmit: ({ value }) => {
                                                  return value < 1
                                                    ? "Введите цену"
                                                    : undefined;
                                                },
                                              }}
                                              children={(priceField) => (
                                                <priceField.NumericField
                                                  suffix=" ₽"
                                                  thousandSeparator=" "
                                                  label="Цена"
                                                  placeholder="Цена"
                                                />
                                              )}
                                            />
                                          </div>
                                        </div>
                                      </React.Fragment>
                                    );
                                  },
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 sm:pl-2 sm:ml-2">
                                  <Button
                                    className="[&_svg]:size-4"
                                    variant="soft"
                                    type="button"
                                    radius="full"
                                    onClick={() =>
                                      productsField.pushValue({
                                        description: "",
                                        price: 0,
                                        link: "",
                                      })
                                    }
                                  >
                                    <PackagePlus />
                                    Добавить товар
                                  </Button>
                                </div>
                              </React.Fragment>
                            );
                          }}
                        />
                      </React.Fragment>
                    );
                  })}

                  <div className="grid sm:grid-cols-2 gap-2 mt-2 sm:pl-2 sm:ml-2">
                    <Button
                      className="[&_svg]:size-4"
                      variant="soft"
                      type="button"
                      radius="full"
                      onClick={() =>
                        shopsField.pushValue({
                          shop: "",
                          products: [{ price: 0, link: "", description: "" }],
                        })
                      }
                    >
                      <Store />
                      Добавить магазин
                    </Button>
                  </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2">
            <form.AppForm>
              <form.SubmitButton label="Зарегистрировать" />
            </form.AppForm>
          </div>
        </form>
      </div>
    );
  },
});
