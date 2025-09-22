import { useEffect, useRef, type FC, type ReactNode } from "react";
import { NumericFormat } from "react-number-format";
import type { NumericFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";

const NumericField: FC<
  NumericFormatProps & {
    hint?: ReactNode;
    label?: string;
    ariaLabel?: string;
    shouldFocusOnMount?: boolean;
  }
> = ({
  label,
  className,
  "aria-label": ariaLabelProp,
  ariaLabel,
  hint,
  shouldFocusOnMount = false,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    field,
    defaultAriaLabel,
    error,
    formMessageId,
    formItemId,
    ariaDescribedBy,
  } = useFieldAccessibility<number>({
    label,
    ariaLabel: ariaLabelProp || ariaLabel,
  });

  useEffect(() => {
    if (shouldFocusOnMount) {
      inputRef.current?.focus();
    }

    return () => {
      if (shouldFocusOnMount) {
        inputRef.current?.blur();
      }
    };
  }, [shouldFocusOnMount]);

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
              <PopoverContent className="p-2 bg-foreground text-background">
                {hint}
                <PopoverArrow className="fill-foreground" />
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
      <NumericFormat
        getInputRef={inputRef}
        aria-label={defaultAriaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={!!error}
        id={formItemId}
        name={field.name}
        type="tel"
        customInput={Input}
        decimalScale={0}
        allowNegative={false}
        isAllowed={(values) => {
          const floatValue = values.floatValue;

          return (
            typeof floatValue === "undefined" ||
            (floatValue >= 0 && floatValue <= 999_999_999)
          );
        }}
        onValueChange={(values) => {
          field.handleChange(values.floatValue || 0);
        }}
        value={field.state.value || ""}
        {...props}
      />
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default NumericField;
