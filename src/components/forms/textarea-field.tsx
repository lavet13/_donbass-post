import { type ComponentProps, type FC } from "react";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import type { TextProps } from "@radix-ui/themes";

type TextareaFieldProps = ComponentProps<typeof AutosizeTextarea> & {
  label?: string;
  ariaLabel?: string;
} & TextProps;

const TextareaField: FC<TextareaFieldProps> = ({
  "aria-label": ariaLabelProp,
  ariaLabel,
  label,
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
      <AutosizeTextarea
        color={color}
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
