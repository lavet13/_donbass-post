import type { FC } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import RPNInput from "react-phone-number-input/input";
import type { DefaultInputComponentProps } from "react-phone-number-input";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import { Input } from "@/components/ui/input";
import type { TextField } from "@radix-ui/themes";

const PhoneField: FC<
  Omit<TextField.RootProps, 'value' | 'onChange'> &
    DefaultInputComponentProps & { label?: string; ariaLabel?: string }
> = ({ label, "aria-label": ariaLabelProp, ariaLabel, ...props }) => {
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
      <RPNInput
        id={formItemId}
        name={field.name}
        inputComponent={Input}
        aria-label={defaultAriaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={!!error}
        value={field.state.value}
        onChange={(value) => field.handleChange(value || "")}
        {...props}
      />
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default PhoneField;
