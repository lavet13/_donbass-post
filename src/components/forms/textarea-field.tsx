import type { ComponentProps, FC } from "react";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";

type TextareaFieldProps = ComponentProps<typeof AutosizeTextarea> & {
  label?: string;
  ariaLabel?: string;
};

const TextareaField: FC<TextareaFieldProps> = ({
  "aria-label": ariaLabelProp,
  ariaLabel,
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
  } = useFieldAccessibility<string>({
    label,
    ariaLabel: ariaLabelProp || ariaLabel,
  });

  return (
    <FormItem>
      {label && <FormLabel htmlFor={formItemId}>{label}</FormLabel>}
      <AutosizeTextarea
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
