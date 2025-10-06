import { Button, Text } from "@radix-ui/themes";
import type { FC } from "react";
import { toast as sonnerToast } from "sonner";

export type ToastProps = {
  id: string | number;
  title: string;
  description: string;
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

const Toast: FC<ToastProps> = (props) => {
  const { title, description, button, id } = props;

  return (
    <div className="flex flex-col rounded-lg bg-background shadow-3 w-full md:w-[364px] items-center p-4">
      <div className="flex w-full items-start">
        <div className="w-full">
          <Text weight="medium" size="2" as="p" className="text-gray-12">
            {title}
          </Text>
          <Text as="p" size="1" className="mt-1 text-gray-11">
            {description}
          </Text>
        </div>
      </div>
      <div className="ml-auto shrink-0">
        <Button
          size="1"
          radius="small"
          variant="surface"
          highContrast
          onClick={() => {
            button.onClick?.();
            sonnerToast.dismiss(id);
          }}
        >
          {button.label}
        </Button>
      </div>
    </div>
  );
};
