import { useEffect, useRef, type ComponentProps, type FC } from "react";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import type { AutosizeTextAreaRef } from "@/components/ui/autosize-textarea";
import type { TextProps } from "@radix-ui/themes";
import { isMobile as isMobileDevice } from "react-device-detect";

type TextareaFieldProps = ComponentProps<typeof AutosizeTextarea> & {
  label?: string;
  ariaLabel?: string;
  shouldFocusOnMount?: boolean;
} & TextProps;

const TextareaField: FC<TextareaFieldProps> = ({
  "aria-label": ariaLabelProp,
  ariaLabel,
  label,
  color,
  shouldFocusOnMount,
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

  const textAreaRef = useRef<
    (HTMLTextAreaElement & AutosizeTextAreaRef) | null
  >(null);

  useEffect(() => {
    const input = textAreaRef.current;
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
      <AutosizeTextarea
        shouldFocus={isMobileDevice}
        color={color}
        ref={textAreaRef}
        id={formItemId}
        name={field.name}
        aria-label={defaultAriaLabel}
        aria-invalid={!!error}
        aria-describedby={ariaDescribedBy}
        value={field.state.value}
        onValueChange={field.handleChange}
        {...props}
      />
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default TextareaField;
