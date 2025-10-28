import {
  useEffect,
  useRef,
  type FC,
  type FocusEvent,
  type InputEvent,
  type ReactNode,
} from "react";

import { cn, composeEventHandlers } from "@/lib/utils";
import { TextField } from "@radix-ui/themes";
import { Slot } from "radix-ui";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { isIOS } from "react-device-detect";
import { isMobile as isMobileDevice } from "react-device-detect";

const Input: FC<
  TextField.RootProps & {
    asChild?: boolean;
    leftElement?: ReactNode;
    rightElement?: ReactNode;
    shouldFocusScrollInto?: boolean;
    shouldSelect?: boolean;
    shouldFocusOnMount?: boolean;
    ref?: React.RefObject<HTMLInputElement | null>;
  }
> = ({
  className,
  asChild,
  children,
  leftElement,
  shouldFocusScrollInto = isMobileDevice,
  shouldFocusOnMount = false,
  shouldSelect = false,
  rightElement,
  ref,
  ...props
}) => {
  const Comp = asChild ? Slot.Root : TextField.Root;
  const inputRef = useRef<HTMLInputElement>(null);
  const composeRef = useComposedRefs(inputRef, ref);

  const handleFocus = (
    event: FocusEvent<HTMLInputElement> | InputEvent<HTMLInputElement>,
  ) => {
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
    <Comp
      onFocus={composeEventHandlers(props.onFocus, handleFocus)}
      ref={composeRef}
      data-slot="input"
      className={cn(
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent",
        "caret-accent-7 dark:caret-accent-11 has-[input[aria-invalid=true]]:caret-red-9 has-[input[aria-invalid=true]]:shadow-[inset_0_0_0_var(--text-field-border-width)_var(--red-8)]",
        className,
      )}
      {...props}
    >
      {leftElement}
      <Slot.Slottable>{children}</Slot.Slottable>
      {rightElement}
    </Comp>
  );
};

export { Input };
