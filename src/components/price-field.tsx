import type { FC } from "react";
import { NumericFormat } from "react-number-format";
import type { NumericFormatProps } from "react-number-format";
import { Input } from "./ui/input";
import { useFieldContext } from "@/hooks/form-context";
import { FormItem, FormLabel, FormMessage } from "./ui/form";

const PriceField: FC<NumericFormatProps & { label: string }> = ({
  label,
  className,
  ...props
}) => {
  const field = useFieldContext<number | undefined>();

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <NumericFormat
        id={field.name}
        name={field.name}
        type="tel"
        customInput={Input}
        thousandSeparator=" "
        suffix=" ₽"
        decimalScale={0}
        allowNegative={false}
        isAllowed={(values) => {
          console.log({ values });
          const floatValue = values.floatValue;

          return (
            typeof floatValue === "undefined" ||
            (floatValue > 0 && floatValue <= 999_999_999)
          );
        }}
        onValueChange={(values) =>
          field.handleChange(values.floatValue || undefined)
        }
        value={field.state.value || ""}
        {...props}
      />
      <FormMessage />
    </FormItem>
  );
};

export default PriceField;
