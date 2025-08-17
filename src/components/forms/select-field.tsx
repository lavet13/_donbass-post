import { Fragment, type FC } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <Select value={field.state.value} onValueChange={field.handleChange}>
        <SelectTrigger
          id={formItemId}
          name={field.name}
          aria-invalid={!!error}
          aria-label={defaultAriaLabel}
          aria-describedby={ariaDescribedBy}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((group, idx, groups) => (
            <Fragment key={idx}>
              <SelectGroup>
                <SelectLabel>{group.label}</SelectLabel>
                {group.items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
              {groups.length - 1 !== idx && <SelectSeparator />}
            </Fragment>
          ))}
        </SelectContent>
      </Select>
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default SelectField;
