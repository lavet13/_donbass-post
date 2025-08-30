import type { ChangeEvent, FC, ReactNode } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";

type TextFieldProps = React.ComponentProps<"input"> & {
  label?: string;
  ariaLabel?: string;
  hint?: ReactNode;
};

const TextField: FC<TextFieldProps> = ({
  label,
  "aria-label": ariaLabelProp,
  ariaLabel,
  hint,
  onChange: onChangeProp,
  ...props
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChangeProp) {
      onChangeProp(e);
    } else {
      field.handleChange(e.target.value);
    }
  };

  return (
    <FormItem>
      {label && (
        <div className="flex items-center gap-1.5">
          <FormLabel htmlFor={formItemId}>{label}</FormLabel>
          {hint && (
            <Popover>
              <PopoverTrigger className="[&_svg]:size-3 hover:text-accent-foreground rounded-md data-[state=open]:text-accent-foreground">
                <Info />
              </PopoverTrigger>
              <PopoverContent className="p-3">
                {hint}
                <PopoverArrow />
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
      <Input
        id={formItemId}
        name={field.name}
        value={field.state.value}
        aria-label={defaultAriaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={!!error}
        onChange={handleChange}
        {...props}
      />
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default TextField;
