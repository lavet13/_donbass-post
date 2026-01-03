import type { FC } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox, type TextProps } from "@radix-ui/themes";
import { cn } from "@/lib/utils";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";

const CheckboxField: FC<
  React.ComponentProps<"input"> & {
    label?: string;
    ariaLabel?: string;
  } & TextProps
> = ({ label, color, ariaLabel, "aria-label": ariaLabelProp, className }) => {
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
      className={cn(
        "my-2 flex flex-col items-start justify-center gap-y-0.5 sm:gap-y-1",
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-2">
        <Checkbox
          color={color}
          className="self-start"
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
        {label && (
          <FormLabel
            color={color}
            className="font-regular m-0"
            htmlFor={formItemId}
          >
            {label}
          </FormLabel>
        )}
      </div>
      <FormMessage className="text-center" id={formMessageId} />
    </FormItem>
  );
};

export default CheckboxField;
