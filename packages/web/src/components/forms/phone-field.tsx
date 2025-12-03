import { type FC } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import RPNInput from "react-phone-number-input/input";
import type { DefaultInputComponentProps } from "react-phone-number-input";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import { Input } from "@/components/ui/input";
import type { TextField, TextProps } from "@radix-ui/themes";

const PhoneField: FC<
  Omit<TextField.RootProps, "value" | "onChange"> &
    DefaultInputComponentProps & {
      label?: string;
      ariaLabel?: string;
    } & Omit<TextProps, "onChange">
> = ({
  label,
  "aria-label": ariaLabelProp,
  ariaLabel,
  color,
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
      {label && (
        <FormLabel color={color} htmlFor={formItemId}>
          {label}
        </FormLabel>
      )}
      <RPNInput
        color={color}
        id={formItemId}
        name={field.name}
        inputComponent={Input}
        aria-label={defaultAriaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={!!error}
        value={field.state.value}
        smartCaret={false} // solved the bug with samsung androids
        onChange={(value) => field.handleChange(value || "")}
        {...props}
      />
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default PhoneField;
