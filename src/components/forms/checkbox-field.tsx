import type { FC } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";

const CheckboxField: FC<
  React.ComponentProps<"input"> & { label: string; ariaLabel?: string }
> = ({ label, ariaLabel, "aria-label": ariaLabelProp, className }) => {
  const {
    field,
    defaultAriaLabel,
    error,
    formMessageId,
    formItemId,
    ariaDescribedBy,
  } = useFieldAccessibility<boolean>({
    label,
    ariaLabel: ariaLabelProp || ariaLabel,
  });

  return (
    <FormItem
      className={cn("flex flex-row items-center my-2 gap-2", className)}
    >
      <Checkbox
        className="self-start mt-0.5"
        id={formItemId}
        name={field.name}
        aria-label={defaultAriaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={!!error}
        checked={field.state.value}
        onCheckedChange={(checked) => {
          const booleanValue = checked === true;
          field.handleChange(booleanValue);
        }}
      />
      <FormLabel htmlFor={formItemId} className="text-sm font-normal">
        {label}
      </FormLabel>
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default CheckboxField;
