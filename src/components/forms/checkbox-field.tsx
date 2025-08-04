import type { FC } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";

const CheckboxField: FC<React.ComponentProps<"input"> & { label: string }> = ({
  label,
  className,
}) => {
  const {
    field,
    defaultAriaLabel,
    error,
    formMessageId,
    formItemId,
    ariaDescribedBy,
  } = useFieldAccessibility<boolean>({ label });

  return (
    <FormItem className={cn("flex items-center", className)}>
      <Checkbox
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
      <FormLabel id={formItemId} className="text-sm font-normal">
        {label}
      </FormLabel>
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default CheckboxField;
