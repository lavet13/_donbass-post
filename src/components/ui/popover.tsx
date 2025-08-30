import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

const Popover: React.FC<React.ComponentProps<typeof PopoverPrimitive.Root>> = (
  props,
) => {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
};

const PopoverTrigger: React.FC<
  React.ComponentProps<typeof PopoverPrimitive.Trigger>
> = ({ className, ...props }) => {
  return (
    <PopoverPrimitive.Trigger
      className={cn("", className)}
      data-slot="popover-trigger"
      {...props}
    />
  );
};

const PopoverContent: React.FC<
  React.ComponentProps<typeof PopoverPrimitive.Content>
> = ({ className, children, align = "center", sideOffset = 5, ...props }) => {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        className={cn(
          "bg-popover text-popover-foreground rounded-sm p-3 w-72 shadow-md border border-border",
          "data-[state=open]:data-[side=top]:animate-slide-down-and-fade data-[state=open]:data-[side=right]:animate-slide-left-and-fade data-[state=open]:data-[side=bottom]:animate-slide-up-and-fade data-[state=open]:data-[side=left]:animate-slide-right-and-fade",
          "outline-hidden z-50",

          // removing blur
          "transform-gpu backface-hidden will-change-auto",
          "[font-smoothing:subpixel-antialiased] [text-rendering:optimizeLegibility]",
          "[-webkit-font-smoothing:subpixel-antialiased]",
          className,
        )}
        align={align}
        sideOffset={sideOffset}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
};

const PopoverClose: React.FC<
  React.ComponentProps<typeof PopoverPrimitive.Close>
> = ({ className, ...props }) => {
  return (
    <PopoverPrimitive.Close
      aria-label="Закрыть"
      data-slot="popover-close"
      className={cn(
        "absolute top-1 right-1 inline-flex items-center justify-center size-6 rounded-full [&_svg]:size-3 hover:bg-popover-foreground/10 active:bg-popover-foreground/15",
        className,
      )}
      {...props}
    />
  );
};

const PopoverArrow: React.FC<
  React.ComponentProps<typeof PopoverPrimitive.Arrow>
> = ({ className, ...props }) => {
  return (
    <PopoverPrimitive.Arrow
      data-slot="popover-arrow"
      className={cn("fill-popover stroke-border", className)}
      {...props}
    />
  );
};

export { Popover, PopoverTrigger, PopoverContent, PopoverClose, PopoverArrow };
