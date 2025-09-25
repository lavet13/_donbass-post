import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import type { ComponentProps, FC } from "react";
import { SegmentedControl } from "@radix-ui/themes";
import { FormItem, FormLabel, FormMessage } from "../ui/form";

type SegmentedControlProps = ComponentProps<typeof SegmentedControl.Root> & {
  options: { value: string; label: string }[];
  label?: string;
  "aria-label"?: string;
  ariaLabel?: string;
};

const SegmentedControlField: FC<SegmentedControlProps> = ({
  options,
  label,
  "aria-label": ariaLabelProp,
  ariaLabel,

  disabled,
  size,
  variant,
  radius,
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
      {label && <FormLabel>{label}</FormLabel>}
      <SegmentedControl.Root
        aria-label={defaultAriaLabel}
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value)}
        disabled={disabled}
        size={size}
        variant={variant}
        radius={radius}
      >
        {options.map(({ value, label }, idx) => (
          <SegmentedControl.Item
            key={value}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy}
            id={`${formItemId}-${idx + 1}`}
            value={value}
          >
            {label}
          </SegmentedControl.Item>
        ))}
      </SegmentedControl.Root>
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default SegmentedControlField;
