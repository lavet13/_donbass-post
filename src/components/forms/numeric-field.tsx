import {
  useRef,
  type ComponentProps,
  type FC,
  type FocusEvent,
  type InputEvent,
} from "react";
import { NumericFormat } from "react-number-format";
import type { NumericFormatProps } from "react-number-format";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import { composeEventHandlers } from "@/lib/utils";
import { isMobile as isMobileDevice } from "react-device-detect";

const NumericField: FC<
  Omit<NumericFormatProps, "size"> &
    Omit<ComponentProps<typeof Input>, "type"> & {
      labelStyles?: string;
      label?: string;
      ariaLabel?: string;
      shouldFocusScrollInto?: boolean;
    }
> = ({
  label,
  labelStyles,
  "aria-label": ariaLabelProp,
  ariaLabel,
  shouldSelect,
  shouldFocusScrollInto = isMobileDevice,
  size,
  color,
  ...props
}) => {
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
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectText = (
    event: FocusEvent<HTMLInputElement> | InputEvent<HTMLInputElement>,
  ) => {
    if (shouldSelect) {
      const input = event.currentTarget;

      setTimeout(() => input.select(), 0);
    }
    if (shouldFocusScrollInto) {
      const input = event.currentTarget;

      const headerHeightStr = getComputedStyle(document.documentElement)
        .getPropertyValue("--header-height")
        .trim();

      let headerHeightPx;

      if (headerHeightStr.endsWith("rem")) {
        const remValue = parseFloat(headerHeightStr);
        const rootFontSize = parseFloat(
          getComputedStyle(document.documentElement).fontSize,
        );
        headerHeightPx = remValue * rootFontSize;
      } else {
        headerHeightPx = parseFloat(headerHeightStr);
      }

      const inputTop = input.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: inputTop - headerHeightPx - 30,
        behavior: "smooth",
      });
    }
  };

  return (
    <FormItem>
      {label && (
        <FormLabel color={color} className={labelStyles} htmlFor={formItemId}>
          {label}
        </FormLabel>
      )}
      <NumericFormat
        color={color}
        onFocus={composeEventHandlers(props.onFocus, handleSelectText)}
        getInputRef={inputRef}
        aria-label={defaultAriaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={!!error}
        id={formItemId}
        name={field.name}
        type="tel"
        customInput={Input as any}
        decimalScale={0}
        allowNegative={false}
        size={size as any}
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
