import { useRef, forwardRef, useEffect } from "react";
import { useImperativeHandle } from "react";
import { useControllableState } from "@/hooks/use-controllable-state";
import { TextArea, type TextAreaProps, type TextProps } from "@radix-ui/themes";
import { cn, composeEventHandlers } from "@/lib/utils";
import { useAutosizeTextArea } from ".";
import { isIOS, isMobile as isMobileDevice } from "react-device-detect";

export type AutosizeTextAreaRef = {
  textArea: HTMLTextAreaElement;
  focus: () => void;
  maxHeight: number;
  minHeight: number;
};

export type AutosizeTextAreaProps = {
  maxHeight?: number;
  minHeight?: number;
  value?: any;
  shouldFocusScrollInto?: boolean;
  shouldSelect?: boolean;
  shouldFocusOnMount?: boolean;
  onValueChange?: (value: any) => void;
} & TextAreaProps &
  TextProps;

export const AutosizeTextarea = forwardRef<
  AutosizeTextAreaRef,
  AutosizeTextAreaProps
>(
  (
    {
      maxHeight = Number.MAX_SAFE_INTEGER,
      minHeight = 52,
      className,
      onValueChange,
      shouldFocusScrollInto = isMobileDevice,
      shouldSelect = false,
      shouldFocusOnMount = false,
      value: valueProp,
      ...props
    },
    ref,
  ) => {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const [value, setValue] = useControllableState({
      defaultProp: "",
      prop: valueProp,
      onChange: onValueChange,
    });

    useAutosizeTextArea({
      textAreaRef,
      triggerAutoSize: value,
      maxHeight,
      minHeight,
    });

    useImperativeHandle(ref, () => ({
      textArea: textAreaRef.current as HTMLTextAreaElement,
      focus: () => textAreaRef?.current?.focus(),
      maxHeight,
      minHeight,
    }));

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(event.target.value);
    };

    const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
      if (shouldSelect) {
        const input = event.currentTarget;

        setTimeout(() => input.select(), 0);
      }
      if (shouldFocusScrollInto && !isIOS) {
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

    useEffect(() => {
      const input = textAreaRef.current;
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
      <TextArea
        {...props}
        value={value}
        ref={textAreaRef}
        onFocus={composeEventHandlers(
          props.onFocus as React.FocusEventHandler<HTMLTextAreaElement>,
          handleFocus,
        )}
        className={cn(
          "caret-accent-7 dark:caret-accent-11 has-[textarea[aria-invalid=true]]:caret-red-9 has-[textarea[aria-invalid=true]]:shadow-[inset_0_0_0_var(--text-area-border-width)_var(--red-8)]",
          className,
        )}
        onChange={composeEventHandlers(
          props.onChange as React.ChangeEventHandler<HTMLTextAreaElement>,
          handleChange,
        )}
      />
    );
  },
);

AutosizeTextarea.displayName = "AutosizeTextarea";
