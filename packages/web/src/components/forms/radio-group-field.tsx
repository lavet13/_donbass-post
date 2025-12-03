import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import type { FC } from "react";
import {
  RadioGroupIndicator,
  RadioGroupItem,
  RadioGroupLabel,
  RadioGroup,
} from "@/components/ui/radio-group";
import { FormItem, FormLabel, FormMessage } from "../ui/form";
import { cn } from "@/lib/utils";

type RadioGroupFieldProps = {
  options: { value: string; label: string }[];
  label?: string;
  labelStyles?: string;
  "aria-label"?: string;
  ariaLabel?: string;
  stretched?: boolean;
};

const RadioGroupField: FC<RadioGroupFieldProps> = ({
  options,
  label,
  labelStyles,
  "aria-label": ariaLabelProp,
  ariaLabel,
  stretched = false,
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
      {label && <FormLabel className={cn("ml-[5px]", labelStyles)}>{label}</FormLabel>}
      <RadioGroup
        name={field.name}
        aria-label={defaultAriaLabel}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
      >
        {options.map(({ value, label }, idx) => (
          <RadioGroupItem
            className={cn(
              "flex-1 inline-flex items-center justify-center sm:inline-flex sm:flex-none",
              stretched && "sm:flex-auto",
            )}
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
      </RadioGroup>
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default RadioGroupField;
