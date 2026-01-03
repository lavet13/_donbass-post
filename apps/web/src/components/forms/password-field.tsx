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
  label?: string;
  ariaLabel?: string;
};

const PasswordField: FC<PasswordFieldProps> = ({
  label,
  "aria-label": ariaLabelProp,
  ariaLabel,
  ...props
}) => {
  const {
    field,
    defaultAriaLabel,
    error,
    formMessageId,
    formItemId,
    ariaDescribedBy,
  } = useFieldAccessibility<string>({
    label,
    ariaLabel: ariaLabelProp || ariaLabel,
  });

  return (
    <FormItem>
      {label && <FormLabel htmlFor={formItemId}>{label}</FormLabel>}
      <PasswordToggleField>
        <PasswordToggleFieldInput
          id={formItemId}
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
