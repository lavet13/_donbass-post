import { createContext } from "@/hooks/create-context";
import { useControllableState } from "@/hooks/use-controllable-state";
import { useMessageTimer } from "@/hooks/use-message-timer";
import React from "react";

/* -------------------------------------------------------------------------------------------------
 * AutoDismissMessage
 * -----------------------------------------------------------------------------------------------*/

const AUTO_DISMISS_MESSAGE_NAME = "AutoDismissMessage";

type Variant = "success" | "warning" | "info" | "error";

type AutoDismissMessageContextValue = {
  variant: Variant;
  open: boolean;
  onOpenChange(open: boolean): void;
  onOpenToggle(): void;
  remainingTime: number;
  durationMs: number;
};

const [AutoDismissMessageProvider, useAutoDismissMessageContext] =
  createContext<AutoDismissMessageContextValue>(AUTO_DISMISS_MESSAGE_NAME);

/* -------------------------------------------------------------------------------------------------
 * AutoDismissMessage Root
 * -----------------------------------------------------------------------------------------------*/

interface AutoDismissMessageProps {
  children?: React.ReactNode;
  variant?: Variant;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  durationMs?: number;
}

const AutoDismissMessage: React.FC<AutoDismissMessageProps> = (props) => {
  const {
    children,
    variant = "success",
    open: openProp,
    defaultOpen,
    onOpenChange,
    onClose,
    durationMs = 15000,
  } = props;

  const [open, setOpen] = useControllableState({
    defaultProp: defaultOpen ?? false,
    prop: openProp,
    onChange: onOpenChange,
    caller: AUTO_DISMISS_MESSAGE_NAME,
  });

  const remainingTime = useMessageTimer({
    open,
    onClose,
    durationMs,
  });

  return (
    <AutoDismissMessageProvider
      durationMs={durationMs}
      remainingTime={remainingTime}
      variant={variant}
      open={open}
      onOpenChange={setOpen}
      onOpenToggle={React.useCallback(
        () => setOpen((prevOpen) => !prevOpen),
        [setOpen],
      )}
    >
      {children}
    </AutoDismissMessageProvider>
  );
};

AutoDismissMessage.displayName = AUTO_DISMISS_MESSAGE_NAME;

/* -------------------------------------------------------------------------------------------------
 * AutoDismissMessage Container
 * -----------------------------------------------------------------------------------------------*/

const CONTAINER_NAME = "AutoDismissMessageContainer";
