import { useMediaQuery } from "@/hooks/use-media-query";
import { Button, Text } from "@radix-ui/themes";
import type { FC, ReactNode } from "react";
import { toast as sonnerToast } from "sonner";

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

const Toast: FC<ToastProps> = (props) => {
  const { title, description, button, id } = props;

  const styles = getComputedStyle(document.documentElement);
  const mdBreakpoint = styles.getPropertyValue("--breakpoint-md");

  const isMobile = useMediaQuery(`(max-width: ${mdBreakpoint})`);

  return (
    <div className="flex flex-col rounded-lg bg-background shadow-3 w-full md:w-[364px] items-center p-4">
      <div className="flex w-full items-start">
        <div className="w-full">
          <Text weight="medium" size="2" mb="2" as="p" className="text-gray-12">
            {title}
          </Text>
          {description}
        </div>
      </div>
      <div className="w-full md:w-auto mt-rx-3 md:mt-rx-2 md:ml-auto shrink-0">
        <Button
          className="w-full"
          color="gray"
          size={isMobile ? "2" : "1"}
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
