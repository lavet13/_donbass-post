import type { ChangeEvent, ComponentProps, FC } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TextField as _TextField } from "@radix-ui/themes";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import { Input } from "@/components/ui/input";

type TextFieldProps = ComponentProps<typeof Input> & {
  label?: string;
  labelStyles?: string;
  ariaLabel?: string;
};

const TextField: FC<TextFieldProps> = ({
  label,
  labelStyles,
  "aria-label": ariaLabelProp,
  ariaLabel,
  onChange: onChangeProp,
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChangeProp) {
      onChangeProp(e);
    } else {
      field.handleChange(e.target.value);
    }
  };

  return (
    <FormItem>
      {label && (
        <FormLabel className={labelStyles} htmlFor={formItemId}>
          {label}
        </FormLabel>
      )}
      <Input
        id={formItemId}
        name={field.name}
        value={field.state.value}
        aria-label={defaultAriaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={!!error}
        onChange={handleChange}
        {...props}
      />
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default TextField;
