import { useEffect, useRef, type FC } from "react";
import { NumericFormat } from "react-number-format";
import type { NumericFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";

const NumericField: FC<
  NumericFormatProps & {
    label?: string;
    ariaLabel?: string;
    shouldFocusOnMount?: boolean;
  }
> = ({
  label,
  className,
  "aria-label": ariaLabelProp,
  ariaLabel,
  shouldFocusOnMount = false,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    field,
    defaultAriaLabel,
    error,
    formMessageId,
    formItemId,
    ariaDescribedBy,
  } = useFieldAccessibility<number>({
    label,
    ariaLabel: ariaLabelProp || ariaLabel,
  });

  useEffect(() => {
    if (shouldFocusOnMount) {
      inputRef.current?.focus();
    }

    return () => {
      if (shouldFocusOnMount) {
        inputRef.current?.blur();
      }
    };
  }, [shouldFocusOnMount]);

  return (
    <FormItem>
      {label && <FormLabel htmlFor={formItemId}>{label}</FormLabel>}
      <NumericFormat
        getInputRef={inputRef}
        aria-label={defaultAriaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={!!error}
        id={formItemId}
        name={field.name}
        type="tel"
        customInput={Input}
        decimalScale={0}
        allowNegative={false}
        isAllowed={(values) => {
          const floatValue = values.floatValue;

          return (
            typeof floatValue === "undefined" ||
            (floatValue >= 0 && floatValue <= 999_999_999)
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

export default NumericField;
