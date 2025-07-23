import type { FC } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";

type TextFieldProps = React.ComponentProps<"input"> & {
  label: string;
};

const TextField: FC<TextFieldProps> = ({ label, ...props }) => {
  const {
    field,
    defaultAriaLabel,
    error,
    formMessageId,
    formItemId,
    ariaDescribedBy,
  } = useFieldAccessibility<string>({ label });

  return (
    <FormItem>
      <FormLabel id={formItemId}>{label}</FormLabel>
      <Input
        id={formItemId || field.name}
        name={field.name}
        value={field.state.value}
        aria-label={defaultAriaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={!!error}
        onChange={(e) => field.handleChange(e.target.value)}
        {...props}
      />
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default TextField;
