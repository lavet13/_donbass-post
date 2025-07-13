import { useFieldContext } from "@/hooks/form-context";
import type { FC } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import RPNInput from "react-phone-number-input/input";
import { Input } from "@/components/ui/input";
import type { DefaultInputComponentProps } from "react-phone-number-input";

const PhoneField: FC<DefaultInputComponentProps & { label: string }> = ({
  label,
  ...props
}) => {
  const field = useFieldContext<string>();

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <RPNInput
        id={field.name}
        name={field.name}
        inputComponent={Input}
        value={field.state.value}
        onChange={(value) => field.handleChange(value || "")}
        {...props}
      />
      <FormMessage />
    </FormItem>
  );
};

export default PhoneField;
