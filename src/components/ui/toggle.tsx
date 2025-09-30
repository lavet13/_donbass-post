import { cn } from "@/lib/utils";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import type { ComponentProps, FC } from "react";

const Toggle: FC<ComponentProps<typeof TogglePrimitive.Root>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(
        "group -outline-offset-1 focus-visible:outline-accent-8 focus-visible:outline-[2px] focus-visible:z-1",
        "[&_svg]:size-4 px-3 py-2 rounded-full text-grayA-11 hover:text-accentA-11 active:text-accentA-11 [box-shadow:inset_0_0_0_1px_var(--gray-a7)] hover:[box-shadow:inset_0_0_0_1px_var(--accent-a8)] hover:bg-accentA-3 active:[box-shadow:inset_0_0_0_1px_var(--accent-a8)] active:bg-accentA-5 w-full sm:w-fit",
        className,
      )}
      {...props}
    >
      <span className="relative leading-none group-active:top-[1px] inline-flex items-center gap-1 truncate">
        {children}
      </span>
    </TogglePrimitive.Root>
  );
};

export { Toggle };
