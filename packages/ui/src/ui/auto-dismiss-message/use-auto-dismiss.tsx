import { useState } from "react";
import type { ReactNode } from "react";
import type { AutoDismissMessageProps } from ".";

type UseAutoDismissProps = AutoDismissMessageProps;

const useAutoDismiss = (props?: UseAutoDismissProps) => {
  const { open: openProp = false, variant: variantProp = "info" } = props || {};

  const [open, setOpen] = useState(openProp);
  const [message, setMessage] = useState<ReactNode | ReactNode[]>(null);
  const [variant, setVariant] =
    useState<AutoDismissMessageProps["variant"]>(variantProp);

  return {
    open,
    setOpen,
    message,
    setMessage,
    variant,
    setVariant,
  };
};

export { useAutoDismiss };
