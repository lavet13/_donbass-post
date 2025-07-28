import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import type { ComponentProps, FC } from "react";
import { FormItem, FormLabel, FormMessage } from "../ui/form";
import {
  PasswordToggleField,
  PasswordToggleFieldIcon,
  PasswordToggleFieldInput,
  PasswordToggleFieldToggle,
} from "@/components/ui/password-toggle-field";
import { Eye, EyeClosed } from "lucide-react";

type PasswordFieldProps = ComponentProps<typeof PasswordToggleFieldInput> & {
  label: string;
};

export const isPasswordValid = (password: string) => {
  if (password.length < 8) {
    return [false, "Слишком короткий пароль"];
  }
  if (/[а-я]/i.test(password)) {
    return [false, "Не должен содержать кириллицу"];
  }
  if (/[^\w]/.test(password)) {
    return [
      false,
      "Не должен содержать спецсимволы (!@#$%^&*()+-={}[]|;:'\",<>.?/ и т.д.)",
    ];
  }
  if (!/[A-Z]/.test(password)) {
    return [false, "Должна быть хотя бы одна заглавная буква"];
  }
  if (!/(?=.*\d.*\d)/.test(password)) {
    return [false, "Хотя бы две цифры"];
  }
  return [true];
};

const PasswordField: FC<PasswordFieldProps> = ({ label, ...props }) => {
  const {
    field,
    defaultAriaLabel,
    error,
    formMessageId,
    formItemId,
    ariaDescribedBy,
  } = useFieldAccessibility<string>({ label });

  return (
    <FormItem>
      <FormLabel id={formItemId}>{label}</FormLabel>
      <PasswordToggleField>
        <PasswordToggleFieldInput
          id={formItemId || field.name}
          name={field.name}
          value={field.state.value}
          aria-label={defaultAriaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={!!error}
          onChange={(e) => field.handleChange(e.target.value)}
          {...props}
        />
        <PasswordToggleFieldToggle>
          <PasswordToggleFieldIcon visible={<Eye />} hidden={<EyeClosed />} />
        </PasswordToggleFieldToggle>
      </PasswordToggleField>
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default PasswordField;
