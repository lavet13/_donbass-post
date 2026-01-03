import { type ComponentProps, type FC } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TextField as _TextField } from "@radix-ui/themes";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import { Input } from "@/components/ui/input";
import { composeEventHandlers } from "@/lib/utils";

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
        onChange={composeEventHandlers(props.onChange, (e) =>
          field.handleChange(e.target.value),
        )}
        {...props}
      />
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default TextField;
