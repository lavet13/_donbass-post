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
        "group block focus-visible:outline-accent-8 -outline-offset-1 focus-visible:z-1 focus-visible:outline-[2px]",
        "text-grayA-11 hover:text-accentA-11 active:text-accentA-11 hover:bg-accentA-3 active:bg-accentA-5 w-full rounded-full [box-shadow:inset_0_0_0_1px_var(--gray-a7)] hover:[box-shadow:inset_0_0_0_1px_var(--accent-a8)] active:[box-shadow:inset_0_0_0_1px_var(--accent-a8)] sm:w-fit [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      <span className="relative flex min-w-0 flex-1 items-center gap-0.5 leading-2 px-3 py-2">
        {children}
      </span>
    </TogglePrimitive.Root>
  );
};

export { Toggle };
