import type { FC, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { TextField } from "@radix-ui/themes";
import { Slot } from "radix-ui";

const Input: FC<
  TextField.RootProps & {
    asChild?: boolean;
    leftElement?: ReactNode;
    rightElement?: ReactNode;
  }
> = ({ className, asChild, children, leftElement, rightElement, ...props }) => {
  const Comp = asChild ? Slot.Root : TextField.Root;

  return (
    <Comp
      data-slot="input"
      className={cn(
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent",
        "has-[input[aria-invalid=true]]:shadow-[inset_0_0_0_var(--text-field-border-width)_var(--red-8)] has-[input[aria-invalid=true]]:caret-red-8",
        className,
      )}
      {...props}
    >
      {leftElement}
      <Slot.Slottable>{children}</Slot.Slottable>
      {rightElement}
    </Comp>
  );
};

export { Input };
