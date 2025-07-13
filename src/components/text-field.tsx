import { useFieldContext } from "@/hooks/form-context";
import type { FC } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type TextFieldProps = React.ComponentProps<"input"> & {
  label: string;
};

const TextField: FC<TextFieldProps> = ({ label, ...props }) => {
  const field = useFieldContext<string>();

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        {...props}
      />
      <FormMessage />
    </FormItem>
  );
};

export default TextField;
