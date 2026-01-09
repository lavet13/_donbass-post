import {
  useRef,
  type ComponentProps,
  type FC,
  type FocusEvent,
  type InputEvent,
} from "react";
import { PatternFormat } from "react-number-format";
import type { PatternFormatProps } from "react-number-format";
import { Input } from "@donbass-post/ui";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import { composeEventHandlers } from "@/lib/utils";
import { isMobile as isMobileDevice } from "react-device-detect";

const PatternField: FC<
  Omit<PatternFormatProps, "size"> &
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
  } = useFieldAccessibility<string>({
    label,
    ariaLabel: ariaLabelProp || ariaLabel,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);

  // It's here because somehow just ignores shouldFocusScrollInto, I don't remember exactly why
  // TODO: Investigate this shit
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
      <PatternFormat
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
        size={size as any}
        onValueChange={(values) => {
          field.handleChange(values.formattedValue || "");
        }}
        value={field.state.value || ""}
        {...props}
      />
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default PatternField;
