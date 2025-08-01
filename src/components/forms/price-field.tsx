import type { FC } from "react";
import { NumericFormat } from "react-number-format";
import type { NumericFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";

const PriceField: FC<NumericFormatProps & { label: string }> = ({
  label,
  className,
  ...props
}) => {
  const {
    field,
    defaultAriaLabel,
    error,
    formMessageId,
    formItemId,
    ariaDescribedBy,
  } = useFieldAccessibility<number>({ label });

  return (
    <FormItem>
      <FormLabel id={formItemId}>{label}</FormLabel>
      <NumericFormat
        aria-label={defaultAriaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={!!error}
        id={formItemId || field.name}
        name={field.name}
        type="tel"
        customInput={Input}
        suffix=" ₽"
        decimalScale={0}
        thousandSeparator=" "
        allowNegative={false}
        isAllowed={(values) => {
          const floatValue = values.floatValue;

          return (
            typeof floatValue === "undefined" ||
            (floatValue > 0 && floatValue <= 999_999_999)
          );
        }}
        onValueChange={(values) => {
          field.handleChange(values.floatValue || 0);
        }}
        value={field.state.value || ""}
        {...props}
      />
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};
export default PriceField;
