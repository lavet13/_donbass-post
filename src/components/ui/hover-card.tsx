import { cn } from "@/lib/utils";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import type { ComponentProps, FC } from "react";

const HoverCard: FC<ComponentProps<typeof HoverCardPrimitive.Root>> = ({
  openDelay = 0,
  closeDelay = 0,
  ...props
}) => {
  return (
    <HoverCardPrimitive.Root
      data-slot="hover-card"
      openDelay={openDelay}
      closeDelay={closeDelay}
      {...props}
    />
  );
};

const HoverCardTrigger: FC<
  ComponentProps<typeof HoverCardPrimitive.Trigger>
> = ({ className, ...props }) => {
  return (
    <HoverCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      className={cn("", className)}
      {...props}
    />
  );
};

const HoverCardContent: FC<
  ComponentProps<typeof HoverCardPrimitive.Content>
> = ({ className, side = "right", align = "start", sideOffset = 0, ...props }) => {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        className={cn(
          "bg-popover text-popover-foreground rounded-lg p-3 w-72 shadow-md border border-border",
          "data-[state=open]:data-[side=top]:animate-slide-down-and-fade data-[state=open]:data-[side=right]:animate-slide-left-and-fade data-[state=open]:data-[side=bottom]:animate-slide-up-and-fade data-[state=open]:data-[side=left]:animate-slide-right-and-fade",
          "outline-hidden z-50",
          className,
        )}
        side={side}
        align={align}
        sideOffset={sideOffset}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
};

const HoverCardArrow: FC<ComponentProps<typeof HoverCardPrimitive.Arrow>> = ({
  className,
  ...props
}) => {
  return (
    <HoverCardPrimitive.Arrow
      data-slot="hover-card-arrow"
      className={cn("fill-popover stroke-border", className)}
      {...props}
    />
  );
};

export { HoverCard, HoverCardTrigger, HoverCardContent, HoverCardArrow };
