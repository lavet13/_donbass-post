import { cn } from "@/lib/utils";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import type { ComponentProps, FC } from "react";
import { buttonVariants } from "./button";

const Toggle: FC<ComponentProps<typeof TogglePrimitive.Root>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <TogglePrimitive.Root
      className={cn(buttonVariants(), "group", className)}
      {...props}
    >
      <span className="relative group-active:top-[1px]">{children}</span>
    </TogglePrimitive.Root>
  );
};

export { Toggle };
