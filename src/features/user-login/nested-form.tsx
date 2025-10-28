import { withForm } from "@/hooks/form";
import { defaultUserLoginOpts } from "./shared-form";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import ru from "react-phone-number-input/locale/ru.json";
import { isPasswordValid } from "@/lib/utils";
import { Fragment } from "react/jsx-runtime";
import * as AutoDismissMessage from "@/components/ui/auto-dismiss-message";

export const UserLoginForm = withForm({
  ...defaultUserLoginOpts,
  render: function Render({ form }) {
    const { open, message, setOpen, setMessage, variant, setVariant } =
      AutoDismissMessage.useAutoDismiss({
        variant: "error",
        durationMs: 20_000,
      });

    return (
      <Fragment>
        <AutoDismissMessage.Root
          variant={variant}
          open={open}
          onOpenChange={setOpen}
        >
          <AutoDismissMessage.Container>
            <AutoDismissMessage.Title>Ошибка!</AutoDismissMessage.Title>
            <AutoDismissMessage.Content>{message}</AutoDismissMessage.Content>
            <AutoDismissMessage.Close />
          </AutoDismissMessage.Container>
        </AutoDismissMessage.Root>
        <form
          className="flex flex-col gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit({ setMessage, setOpen, setVariant });
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
                country="RU"
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
            <form.SubmitButton
              label="Войти в аккаунт"
              loadingMessage="Входим в аккаунт"
            />
          </form.AppForm>
        </form>
      </Fragment>
    );
  },
});
