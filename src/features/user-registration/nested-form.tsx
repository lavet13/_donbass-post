import { withForm } from "@/hooks/form";
import { defaultUserRegistrationOpts } from "@/features/user-registration/shared-form";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import ru from "react-phone-number-input/locale/ru.json";
import { isPasswordValid } from "@/lib/utils";

export const UserRegistrationForm = withForm({
  ...defaultUserRegistrationOpts,
  render: function ({ form }) {
    return (
      <form
        className="flex flex-col gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.AppField
          name="phone"
          validators={{
            onChange: ({ value }) => {
              return !isPossiblePhoneNumber(value)
                ? "Проверьте правильно ли ввели номер телефона"
                : undefined;
            },
          }}
          children={(field) => (
            <field.PhoneField
              label="Номер телефона"
              placeholder="Введите номер телефона"
              country={"RU"}
              international
              withCountryCallingCode
              labels={ru}
            />
          )}
        />

        <form.AppField
          name="password"
          validators={{
            onChange: ({ value }) => {
              const [isValid, errorMessage] = isPasswordValid(value);
              if (!isValid) {
                return errorMessage;
              }
              return undefined;
            },
          }}
          children={(field) => <field.PasswordField label="Пароль" />}
        />

        <form.AppField
          name="confirmPassword"
          validators={{
            onChangeListenTo: ["password"],
            onChange: ({ value, fieldApi }) => {
              if (value !== fieldApi.form.getFieldValue("password")) {
                return "Пароли не совпадают";
              }
              return undefined;
            },
          }}
          children={(field) => (
            <field.PasswordField label="Подтвердите пароль" />
          )}
        />

        <form.AppForm>
          <form.SubscribeButton label="Зарегистрироваться" loadingMessage="Регистрируем" />
        </form.AppForm>
      </form>
    );
  },
});
