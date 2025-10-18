import { withForm } from "@/hooks/form";
import { defaultShopCostCalculationOrderOpts } from "@/routes/_public/shop-cost-calculation-order/-shared/shared-form";
import React, { Fragment } from "react";
import { Button, Card, Heading, Separator, Tooltip } from "@radix-ui/themes";
import { z } from "zod";
import { getEmailErrorMessage } from "@/lib/utils";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { usePointPostQuery } from "@/features/point/queries";
import { PackagePlus, Store, X } from "lucide-react";
import { AccessibleIcon } from "@radix-ui/themes";
import { useBlocker } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-form";
import { TypographyH2 } from "@/components/typography/typographyH2";
import { HighlightText } from "@/components/typography/highlight-text";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TypographyH3 } from "@/components/typography/typographyH3";
import * as AutoDismissMessage from "@/components/ui/auto-dismiss-message";

// https://colinhacks.com/essays/reasonable-email-regex
// Исходный regex из Zod:
// /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_'+\-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i;
const emailSchema = z.email({ pattern: z.regexes.email });
const linkSchema = z.url();

export const ShopCostCalculationOrderForm = withForm({
  ...defaultShopCostCalculationOrderOpts,
  render: function Render({ form }) {
    const {
      data: values,
      isLoading,
      refetch: refetchPoints,
    } = usePointPostQuery();

    const isDefaultValue = useStore(
      form.store,
      (state) => state.isDefaultValue,
    );

    const { open, message, setOpen, setMessage, variant, setVariant } =
      AutoDismissMessage.useAutoDismiss();

    useBlocker({
      shouldBlockFn: () => {
        if (isDefaultValue) return false;

        const shouldLeave = confirm(
          "Вы действительно хотите покинуть страницу? Форма была заполнена!",
        );
        return !shouldLeave;
      },
    });

    const styles = getComputedStyle(document.documentElement);
    const smBreakpoint = styles.getPropertyValue("--breakpoint-sm");

    const isMobile = useMediaQuery(`(max-width: ${smBreakpoint})`);

    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="xs:h-2 h-4 shrink-0" />
        <TypographyH2 className="pb-2 text-start sm:text-center">
          Оформление заявки на просчет стоимости на{" "}
          <HighlightText>выкуп заказов</HighlightText>
        </TypographyH2>
        <AutoDismissMessage.Root
          variant={variant}
          open={open}
          onOpenChange={setOpen}
          durationMs={60_000}
        >
          <AutoDismissMessage.Container>
            <AutoDismissMessage.Title>
              Регистрация заявки на просчет стоимости успешно проведена!
            </AutoDismissMessage.Title>
            <AutoDismissMessage.Content>{message}</AutoDismissMessage.Content>
            <AutoDismissMessage.Close />
          </AutoDismissMessage.Container>
        </AutoDismissMessage.Root>
        <Card my="2" size={isMobile ? "2" : "3"}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit({ setMessage, setOpen, setVariant });
            }}
          >
            <TypographyH3 className="sm:mb-1">Получатель</TypographyH3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-2">
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
                    label="Телефон"
                    placeholder="Заполните номер телефона"
                    // country={"RU"}
                    // international
                    // withCountryCallingCode
                    // labels={ru}
                  />
                )}
              />
            </div>

            <Separator size="2" className="sm:my-rx-4 my-rx-3 mx-auto" />
            <TypographyH3 className="sm:mb-1">Пункт выдачи</TypographyH3>

            {/* Пункт выдачи*/}
            <div>
              <form.AppField
                name="shopCostCalculationOrder.pointTo"
                validators={{
                  onChange: ({ value }) => {
                    if (typeof value === "string" && !value.length) {
                      return "Выберите отделение";
                    }
                    return undefined;
                  },
                }}
                children={(pointToField) => {
                  return (
                    <pointToField.ComboboxField
                      label="Отделение"
                      placeholder="Выберите отделение"
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

            <Separator size="2" className="sm:my-rx-4 my-rx-3 mx-auto" />
            <TypographyH3 className="sm:mb-1">Заказ</TypographyH3>

            {/* Заказ */}
            <form.AppField
              name="shopCostCalculationOrderPosition"
              mode="array"
              children={(shopsField) => {
                return (
                  <div className="mb-rx-5 sm:mb-rx-6 grid">
                    {shopsField.state.value.map((_, shopIndex) => {
                      return (
                        <React.Fragment key={shopIndex}>
                          {shopIndex !== 0 && (
                            <Fragment>
                              <Separator
                                size="2"
                                className="sm:my-rx-5 my-rx-3 mx-auto"
                              />
                              <div className="mt-2 flex items-center justify-between">
                                <Tooltip content="Удалить магазин и товары">
                                  <button
                                    className="text-redA-11 hover:bg-redA-3 active:bg-redA-4 focus-visible:ring-red-8 pointer-events-auto relative -bottom-1 ml-auto inline-flex size-6 shrink-0 cursor-default items-center justify-center rounded-full outline-none focus-visible:ring-[2px] [&_svg]:size-3"
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
                            </Fragment>
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
                                          <div className="relative mt-2 ml-1 flex flex-col gap-1 px-2 py-1">
                                            {productIndex === 0 && (
                                              <Heading
                                                size="2"
                                                as="h3"
                                                className="font-medium"
                                              >
                                                Товар № {productIndex + 1}
                                              </Heading>
                                            )}
                                            {productIndex !== 0 && (
                                              <div className="mt-2 flex items-center justify-between">
                                                <Heading
                                                  size="2"
                                                  as="h3"
                                                  className="font-medium"
                                                >
                                                  Товар № {productIndex + 1}
                                                </Heading>
                                                <Tooltip content="Удалить товар">
                                                  <button
                                                    className="text-redA-11 hover:bg-redA-3 active:bg-redA-4 focus-visible:ring-red-8 pointer-events-auto relative -bottom-1 ml-auto inline-flex size-6 shrink-0 cursor-default items-center justify-center rounded-full outline-none focus-visible:ring-[2px] [&_svg]:size-3"
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

                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-2">
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
                                                      linkSchema.safeParse(
                                                        value,
                                                      );

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
                                                children={(
                                                  descriptionField,
                                                ) => (
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

                                  <div className="mt-2 grid grid-cols-1 gap-2 sm:ml-2 sm:grid-cols-2 sm:pl-2">
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

                    <div className="mt-2 grid gap-2 sm:ml-2 sm:grid-cols-2 sm:pl-2">
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

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-2">
              <form.AppForm>
                <form.SubmitButton label="Зарегистрировать" />
              </form.AppForm>
            </div>
          </form>
        </Card>
      </div>
    );
  },
});
