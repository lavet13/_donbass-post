import { useEffect, useRef, type FC } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import RPNInput from "react-phone-number-input/input";
import type { DefaultInputComponentProps } from "react-phone-number-input";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import { Input } from "@/components/ui/input";
import { isMobile as isMobileDevice } from "react-device-detect";
import type { TextField, TextProps } from "@radix-ui/themes";

const PhoneField: FC<
  Omit<TextField.RootProps, "value" | "onChange"> &
    DefaultInputComponentProps & {
      label?: string;
      ariaLabel?: string;
      shouldFocusOnMount?: boolean;
    } & Omit<TextProps, "onChange">
> = ({
  label,
  "aria-label": ariaLabelProp,
  shouldFocusOnMount,
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

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    if (shouldFocusOnMount) {
      input.focus();
    }

    return () => {
      if (shouldFocusOnMount) {
        input.blur();
      }
    };
  }, [shouldFocusOnMount]);

  return (
    <FormItem>
      {label && (
        <FormLabel color={color} htmlFor={formItemId}>
          {label}
        </FormLabel>
      )}
      <RPNInput
        color={color}
        shouldFocus={isMobileDevice}
        ref={inputRef}
        id={formItemId}
        name={field.name}
        inputComponent={Input}
        aria-label={defaultAriaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={!!error}
        value={field.state.value}
        smartCaret={false}
        onChange={(value) => field.handleChange(value || "")}
        {...props}
      />
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default PhoneField;
