import { withForm } from "@/hooks/form";
import { defaultUserLoginOpts } from "./shared-form";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import ru from "react-phone-number-input/locale/ru.json";
import { isPasswordValid } from "@/lib/utils";
import { Fragment } from "react/jsx-runtime";
import {
  AutoDismissMessage,
  type AutoDimissMessageProps,
} from "@/components/auto-dismiss-message";
import { useState } from "react";

export const UserLoginForm = withForm({
  ...defaultUserLoginOpts,
  render: function ({ form }) {
    const [message, setMessage] = useState<AutoDimissMessageProps>({
      isOpen: false,
      onClose() {
        setMessage((prev) => ({ ...prev, isOpen: true }));
      },
      title: "Сообщение",
    });


    return (
      <Fragment>
        <AutoDismissMessage {...message} />
        <form
          className="flex flex-col gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
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

          <form.AppForm>
            <form.SubscribeButton
              label="Войти в аккаунт"
              loadingMessage="Входим в аккаунт"
            />
          </form.AppForm>
        </form>
      </Fragment>
    );
  },
});
