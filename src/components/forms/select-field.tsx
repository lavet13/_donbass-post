import { Fragment, type FC } from "react";
import { Select } from "@radix-ui/themes";
import { FormItem, FormLabel, FormMessage } from "../ui/form";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";

type SelectFieldProps = {
  options?: { label: string; items: { value: string; label: string }[] }[];
  "aria-label"?: string;
  label?: string;
  placeholder?: string;
  ariaLabel?: string;
};

const SelectField: FC<SelectFieldProps> = ({
  label,
  placeholder,
  "aria-label": ariaLabelProp,
  ariaLabel,
  options = [],
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
      {label && <FormLabel htmlFor={formItemId}>{label}</FormLabel>}
      <Select.Root value={field.state.value} onValueChange={field.handleChange}>
        <Select.Trigger
          title={field.state.value || placeholder}
          placeholder={placeholder}
          id={formItemId}
          name={field.name}
          aria-invalid={!!error}
          aria-label={defaultAriaLabel}
          aria-describedby={ariaDescribedBy}
        />
        <Select.Content>
          {options.map((group, idx, groups) => (
            <Fragment key={idx}>
              <Select.Group>
                <Select.Label>{group.label}</Select.Label>
                {group.items.map((item) => (
                  <Select.Item key={item.value} value={item.value}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Group>
              {groups.length - 1 !== idx && <Select.Separator />}
            </Fragment>
          ))}
        </Select.Content>
      </Select.Root>
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default SelectField;
