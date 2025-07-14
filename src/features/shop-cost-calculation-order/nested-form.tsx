import { withForm } from "@/hooks/form";
import { defaultShopCostCalculationOrderOpts } from "@/features/shop-cost-calculation-order/shared-form";
import React from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { getEmailErrorMessage } from "@/lib/utils";
import ru from "react-phone-number-input/locale/ru.json";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { usePointPostQuery } from "@/features/point/queries";

// https://colinhacks.com/essays/reasonable-email-regex
// Исходный regex из Zod:
// /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_'+\-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i;
const emailSchema = z.email({ pattern: z.regexes.email });

const linkSchema = z.url();

export const ShopCostCalculationOrderForm = withForm({
  ...defaultShopCostCalculationOrderOpts,
  render: function ({ form }) {
    const { data: values, isLoading } = usePointPostQuery();

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
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
          children={(field) => <field.TextField label="Фамилия" />}
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
          children={(field) => <field.TextField label="Имя" />}
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
          children={(field) => <field.TextField label="Отчество" />}
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
          children={(field) => <field.TextField type="email" label="E-mail" />}
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
              placeholder="Введите номер телефона"
              country={"RU"}
              international
              withCountryCallingCode
              labels={ru}
            />
          )}
        />

        {/* Пункт выдачи*/}
        <form.AppField
          name="shopCostCalculationOrder.pointTo"
          children={(pointToField) => {
            return (
              <pointToField.ComboboxField
                label="Пункт выдачи"
                aria-label="Выбрать пункт выдачи"
                emptyMessage="Таких отделений нет"
                inputPlaceholder="Найти отделение..."
                isLoading={isLoading}
                values={values}
              />
            );
          }}
        />

        {/* Заказ */}
        <form.AppField
          name="shop"
          mode="array"
          children={(shopsField) => {
            return (
              <>
                {shopsField.state.value.map((_, shopIndex) => {
                  return (
                    <React.Fragment key={shopIndex}>
                      <form.AppField
                        key={shopIndex}
                        name={`shop[${shopIndex}].name`}
                        validators={{
                          onChange: ({ value }) => {
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
                            label="Магазин"
                            placeholder="Магазин(Ссылка|Название)"
                          />
                        )}
                      />

                      <form.Field
                        name={`shop[${shopIndex}].products`}
                        mode="array"
                        children={(productsField) => {
                          return (
                            <React.Fragment>
                              {productsField.state.value.map(
                                (_, productIndex) => {
                                  return (
                                    <React.Fragment key={productIndex}>
                                      <form.AppField
                                        name={`shop[${shopIndex}].products[${productIndex}].link`}
                                        validators={{
                                          onChange: ({ value }) => {
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
                                        name={`shop[${shopIndex}].products[${productIndex}].description`}
                                        validators={{
                                          onChange: ({ value }) => {
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
                                        name={`shop[${shopIndex}].products[${productIndex}].price`}
                                        validators={{
                                          onSubmit: ({ value }) => {
                                            return !value.length
                                              ? "Введите цену"
                                              : undefined;
                                          },
                                        }}
                                        children={(priceField) => (
                                          <priceField.PriceField
                                            label="Цена"
                                            placeholder="Цена"
                                          />
                                        )}
                                      />
                                    </React.Fragment>
                                  );
                                },
                              )}

                              <Button
                                type="button"
                                onClick={() =>
                                  productsField.pushValue({
                                    description: "",
                                    price: "",
                                    link: "",
                                  })
                                }
                              >
                                Добавить товар
                              </Button>
                            </React.Fragment>
                          );
                        }}
                      />
                    </React.Fragment>
                  );
                })}

                <Button
                  type="button"
                  onClick={() =>
                    shopsField.pushValue({
                      name: "",
                      products: [{ price: "", link: "", description: "" }],
                    })
                  }
                >
                  Добавить магазин
                </Button>
              </>
            );
          }}
        />

        <form.AppField
          name="accepted"
          children={(field) => (
            <field.CheckboxField label="Подтверждаю, что мне исполнилось 18 лет, и ознакомился с правилами предоставления услуг" />
          )}
        />

        <form.AppForm>
          <form.SubscribeButton label="Зарегистрировать" />
        </form.AppForm>
      </form>
    );
  },
});
