import type { FC } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import RPNInput from "react-phone-number-input/input";
import { Input } from "@/components/ui/input";
import type { DefaultInputComponentProps } from "react-phone-number-input";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";

const PhoneField: FC<DefaultInputComponentProps & { label: string }> = ({
  label,
  ...props
}) => {
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
