import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import type { FC } from "react";
import {
  RadioGroupIndicator,
  RadioGroupItem,
  RadioGroupLabel,
  RadioGroupRoot,
} from "@/components/ui/radio-group";
import { FormItem, FormMessage } from "../ui/form";

type RadioGroupFieldProps = {
  options: { value: string; label: string }[];
  "aria-label"?: string;
  ariaLabel?: string;
};

const RadioGroupField: FC<RadioGroupFieldProps> = ({
  options,
  "aria-label": ariaLabelProp,
  ariaLabel,
}) => {
  const {
    field,
    error,
    defaultAriaLabel,
    formMessageId,
    formItemId,
    ariaDescribedBy,
  } = useFieldAccessibility<string>({ ariaLabel: ariaLabelProp || ariaLabel });

  return (
    <FormItem>
      <RadioGroupRoot
        name={field.name}
        aria-label={defaultAriaLabel}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
      >
        {options.map(({ value, label }, idx) => (
          <RadioGroupItem
            key={value}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy}
            id={`${formItemId}-${idx + 1}`}
            value={value}
          >
            <RadioGroupIndicator />
            <RadioGroupLabel htmlFor={`${formItemId}-${idx + 1}`}>
              {label}
            </RadioGroupLabel>
          </RadioGroupItem>
        ))}
      </RadioGroupRoot>
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default RadioGroupField;
