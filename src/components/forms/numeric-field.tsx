import { useEffect, useRef, type ComponentProps, type FC } from "react";
import { NumericFormat } from "react-number-format";
import type { NumericFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";

const NumericField: FC<
  Omit<NumericFormatProps, 'size'> & Omit<ComponentProps<typeof Input>, 'type'> & {
    labelStyles?: string;
    label?: string;
    ariaLabel?: string;
    shouldFocusOnMount?: boolean;
  }
> = ({
  label,
  labelStyles,
  "aria-label": ariaLabelProp,
  ariaLabel,
  shouldFocusOnMount = false,
  size,
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
      {label && (
        <FormLabel className={labelStyles} htmlFor={formItemId}>
          {label}
        </FormLabel>
      )}
      <NumericFormat
        getInputRef={inputRef}
        aria-label={defaultAriaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={!!error}
        id={formItemId}
        name={field.name}
        type="tel"
        customInput={Input as any}
        decimalScale={0}
        allowNegative={false}
        size={size as any}
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
