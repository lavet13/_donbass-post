import type { FC } from "react";
import { NumericFormat } from "react-number-format";
import type { NumericFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "@/hooks/form-context";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const PriceField: FC<NumericFormatProps & { label: string }> = ({
  label,
  className,
  ...props
}) => {
  const field = useFieldContext<number>();

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <NumericFormat
        id={field.name}
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
      <FormMessage />
    </FormItem>
  );
};
export default PriceField;
