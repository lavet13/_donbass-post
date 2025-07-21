import { useFieldContext } from "@/hooks/form-context";
import type { FC } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const CheckboxField: FC<React.ComponentProps<"input"> & { label: string }> = ({
  label,
  className,
}) => {
  const field = useFieldContext<boolean>();
  const hasErrors = !!field.state.meta.errors.length;

  return (
    <FormItem className={cn("flex items-center", className)}>
      <Checkbox
        id={field.name}
        name={field.name}
        aria-invalid={hasErrors}
        checked={field.state.value}
        onCheckedChange={(checked) => {
          const booleanValue = checked === true;
          field.handleChange(booleanValue);
        }}
      />
      <FormLabel className="text-sm font-normal">{label}</FormLabel>
      <FormMessage />
    </FormItem>
  );
};

export default CheckboxField;
