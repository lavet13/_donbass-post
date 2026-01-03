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

const Toast: FC<ToastProps> = (props) => {
  const { title, description, button, id } = props;

  return (
    <div className="bg-background shadow-3 flex w-full flex-col items-center rounded-lg p-4 md:w-[364px]"> <div className="flex w-full items-start">
        <div className="w-full">
          <Text weight="medium" size="3" mb="2" as="p" className="text-gray-12">
            {title}
          </Text>
          {description}
        </div>
      </div>
      <div className="mt-rx-3 md:mt-rx-2 w-full shrink-0 md:ml-auto md:w-auto">
        <Button
          className="w-full"
          color="red"
          size="2"
          radius="full"
          variant="solid"
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

export default Toast;
