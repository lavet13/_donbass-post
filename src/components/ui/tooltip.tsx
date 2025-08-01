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
  return <TooltipPrimitive.Trigger className={cn("", className)} {...props} />;
};

const TooltipContent: FC<ComponentProps<typeof TooltipPrimitive.Content>> = ({
  className,
  ...props
}) => {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={cn(
          "data-[state=delayed-open]:data-[side=top]:animate-slide-down-and-fade",
          "data-[state=delayed-open]:data-[side=right]:animate-slide-left-and-fade",
          "data-[state=delayed-open]:data-[side=bottom]:animate-slide-up-and-fade",
          "data-[state=delayed-open]:data-[side=left]:animate-slide-right-and-fade",
          "rounded-sm px-[15px] py-[10px] text-base md:text-sm leading-none bg-popover text-popover-foreground shadow-md select-none",

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
      className={cn("fill-popover", className)}
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
