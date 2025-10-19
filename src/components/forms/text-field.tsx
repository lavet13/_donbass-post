import { useEffect, useRef, type ComponentProps, type FC } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TextField as _TextField } from "@radix-ui/themes";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import { Input } from "@/components/ui/input";
import { isMobile as isMobileDevice } from "react-device-detect";
import { composeEventHandlers } from "@/lib/utils";

type TextFieldProps = ComponentProps<typeof Input> & {
  label?: string;
  labelStyles?: string;
  ariaLabel?: string;
  shouldFocusOnMount?: boolean;
};

const TextField: FC<TextFieldProps> = ({
  label,
  labelStyles,
  "aria-label": ariaLabelProp,
  ariaLabel,
  shouldFocusOnMount = false,
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

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    if (shouldFocusOnMount) {
      input.focus();
    }

    return () => {
      if (shouldFocusOnMount) {
        input.blur();
      }
    };
  }, [shouldFocusOnMount]);

  return (
    <FormItem>
      {label && (
        <FormLabel className={labelStyles} htmlFor={formItemId}>
          {label}
        </FormLabel>
      )}
      <Input
        ref={inputRef}
        shouldFocus={isMobileDevice}
        id={formItemId}
        name={field.name}
        value={field.state.value}
        aria-label={defaultAriaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={!!error}
        onChange={composeEventHandlers(props.onChange, (e) =>
          field.handleChange(e.target.value),
        )}
        {...props}
      />
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default TextField;
