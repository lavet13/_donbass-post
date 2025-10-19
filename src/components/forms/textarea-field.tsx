import { useEffect, useRef, type ComponentProps, type FC } from "react";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import type { AutosizeTextAreaRef } from "@/components/ui/autosize-textarea";

type TextareaFieldProps = ComponentProps<typeof AutosizeTextarea> & {
  label?: string;
  ariaLabel?: string;
  shouldFocusOnMount?: boolean;
};

const TextareaField: FC<TextareaFieldProps> = ({
  "aria-label": ariaLabelProp,
  ariaLabel,
  label,
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
      {label && <FormLabel htmlFor={formItemId}>{label}</FormLabel>}
      <AutosizeTextarea
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
