import { type ComponentProps, type FC } from "react";
import { FormItem, FormLabel, FormMessage } from "./form-primitives";
import { useFieldAccessibility } from "../hooks/use-field-accessibility";
import { Input } from "@donbass-post/ui/input";
import { composeEventHandlers } from "@donbass-post/ui/utils";

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
