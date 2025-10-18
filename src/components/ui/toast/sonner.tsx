import type { ReactNode } from "react";
import { toast as sonnerToast } from "sonner";
import { Toast } from ".";

export type ToastProps = {
  id: string | number;
  title: string;
  description: ReactNode;
  button: {
    label: string;
    onClick?: () => void;
  };
};

export function sonner(toast: Omit<ToastProps, "id">) {
  return sonnerToast.custom((id) => (
    <Toast
      id={id}
      title={toast.title}
      description={toast.description}
      button={{
        label: toast.button.label,
        onClick: toast.button.onClick,
      }}
    />
  ));
}
