import { withForm } from "@/hooks/form";
import { defaultShopCostCalculationOrderOpts } from "@/features/shop-cost-calculation-order/shared-form";
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { getEmailErrorMessage } from "@/lib/utils";
import ru from "react-phone-number-input/locale/ru.json";
import { isPossiblePhoneNumber } from "react-phone-number-input";

// https://colinhacks.com/essays/reasonable-email-regex
// Исходный regex из Zod:
// /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_'+\-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i;
const emailSchema = z.email({ pattern: z.regexes.email });

export const ShopCostCalculationOrderForm = withForm({
  ...defaultShopCostCalculationOrderOpts,
  render: function ({ form }) {
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
            onChange: ({ value }) =>
              value.length < 2 || value.length > 50
                ? "Фамилия должна быть от 2 до 50 символов"
                : undefined,
          }}
          children={(field) => <field.TextField label="Фамилия" />}
        />
        <form.AppField
          name="shopCostCalculationOrder.name"
          validators={{
            onChange: ({ value }) =>
              value.length < 2 || value.length > 50
                ? "Имя должно быть от 2 до 50 символов"
                : undefined,
          }}
          children={(field) => <field.TextField label="Имя" />}
        />
        <form.AppField
          name="shopCostCalculationOrder.patronymic"
          validators={{
            onChange: ({ value }) =>
              value.length < 2 || value.length > 50
                ? "Отчество должно быть от 2 до 50 символов"
                : undefined,
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
                          onChange: ({ value }) =>
                            value.length < 2 || value.length > 50
                              ? "Магазин не должен быть короче 2 символов и длиннее 50"
                              : undefined,
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
                                        children={(linkField) => (
                                          <linkField.TextField
                                            label="Ссылка"
                                            placeholder="Ссылка"
                                          />
                                        )}
                                      />

                                      <form.AppField
                                        name={`shop[${shopIndex}].products[${productIndex}].description`}
                                        children={(descriptionField) => (
                                          <descriptionField.TextField
                                            label="Описание"
                                            placeholder="Размер, цвет и так далее"
                                          />
                                        )}
                                      />

                                      <form.AppField
                                        name={`shop[${shopIndex}].products[${productIndex}].price`}
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
                                    price: 0,
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
                      products: [{ price: 0, link: "", description: "" }],
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

        <form.Subscribe
          selector={(state) => [
            state.canSubmit,
            state.isSubmitting,
            state.isDefaultValue,
            state.values.accepted,
          ]}
          children={([canSubmit, isSubmitting, isDefaultValue, isAccepted]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isDefaultValue || !isAccepted}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Подтверждается
                </>
              ) : (
                <>Зарегистрировать</>
              )}
            </Button>
          )}
        />
      </form>
    );
  },
});
