import { cn } from "@/lib/utils";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import type { ComponentProps, FC } from "react";

const Toggle: FC<ComponentProps<typeof TogglePrimitive.Root>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <TogglePrimitive.Root data-slot="toggle" className={cn("group", className)} {...props}>
      <span className="relative group-active:top-[1px] inline-flex items-center gap-2 truncate">
        {children}
      </span>
    </TogglePrimitive.Root>
  );
};

export { Toggle };
