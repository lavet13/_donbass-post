import { cn } from "@/lib/utils";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps, FC } from "react";

const TooltipRoot: FC<ComponentProps<typeof TooltipPrimitive.Root>> = (
  props,
) => {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
};

const TooltipTrigger: FC<ComponentProps<typeof TooltipPrimitive.Trigger>> = ({
  className,
  ...props
}) => {
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      className={cn("", className)}
      {...props}
    />
  );
};

const TooltipContent: FC<ComponentProps<typeof TooltipPrimitive.Content>> = ({
  className,
  ...props
}) => {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        className={cn(
          "data-[state=delayed-open]:data-[side=top]:animate-slide-down-and-fade",
          "data-[state=delayed-open]:data-[side=right]:animate-slide-left-and-fade",
          "data-[state=delayed-open]:data-[side=bottom]:animate-slide-up-and-fade",
          "data-[state=delayed-open]:data-[side=left]:animate-slide-right-and-fade",
          "rounded-sm px-[12px] py-[7px] text-base md:text-sm leading-none bg-foreground text-background shadow-md select-none z-50",

          // removing blur
          "transform-gpu backface-hidden will-change-auto",
          "[font-smoothing:subpixel-antialiased] [text-rendering:optimizeLegibility]",
          "[-webkit-font-smoothing:subpixel-antialiased]",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
};

const TooltipArrow: FC<ComponentProps<typeof TooltipPrimitive.Arrow>> = ({
  className,
  ...props
}) => {
  return (
    <TooltipPrimitive.Arrow
      data-slot="tooltip-arrow"
      className={cn("fill-foreground", className)}
      {...props}
    />
  );
};

const Tooltip: FC<
  ComponentProps<typeof TooltipPrimitive.Content> &
    Pick<
      ComponentProps<typeof TooltipPrimitive.Root>,
      "open" | "defaultOpen" | "onOpenChange"
    >
> = ({ open, onOpenChange, defaultOpen, children, content, ...props }) => {
  return (
    <TooltipRoot
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent {...props}>
        {content}
        <TooltipArrow />
      </TooltipContent>
    </TooltipRoot>
  );
};

export { Tooltip, TooltipRoot, TooltipTrigger, TooltipContent, TooltipArrow };
