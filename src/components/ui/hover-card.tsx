import { cn } from "@/lib/utils";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import type { ComponentProps, FC } from "react";

const HoverCard: FC<ComponentProps<typeof HoverCardPrimitive.Root>> = ({
  openDelay = 0,
  closeDelay = 50,
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
> = ({
  className,
  side = "right",
  align = "start",
  sideOffset = 5,
  ...props
}) => {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <div className="radix-themes">
        <HoverCardPrimitive.Content
          data-slot="hover-card-content"
          data-is-root-theme="true"
          data-accent-color="red"
          data-gray-color="gray"
          data-has-background="true"
          data-panel-background="translucent"
          data-radius="medium"
          data-scaling="100%"
          className={cn(
            "rounded-lg shadow-4 p-3 bg-panel-solid max-h-[var(--radix-hover-card-content-available-height)]",
            "outline-hidden z-0",

            // Invisible bridge for all sides
            "data-[side=right]:before:content-[''] data-[side=right]:before:absolute data-[side=right]:before:right-full data-[side=right]:before:top-0 data-[side=right]:before:w-2 data-[side=right]:before:h-full data-[side=right]:before:bg-transparent",
            "data-[side=left]:before:content-[''] data-[side=left]:before:absolute data-[side=left]:before:left-full data-[side=left]:before:top-0 data-[side=left]:before:w-2 data-[side=left]:before:h-full data-[side=left]:before:bg-transparent",
            "data-[side=top]:before:content-[''] data-[side=top]:before:absolute data-[side=top]:before:bottom-full data-[side=top]:before:left-0 data-[side=top]:before:w-full data-[side=top]:before:h-2 data-[side=top]:before:bg-transparent",
            "data-[side=bottom]:before:content-[''] data-[side=bottom]:before:absolute data-[side=bottom]:before:top-full data-[side=bottom]:before:left-0 data-[side=bottom]:before:w-full data-[side=bottom]:before:h-2 data-[side=bottom]:before:bg-transparent",
            className,
          )}
          side={side}
          align={align}
          sideOffset={sideOffset}
          {...props}
        />
      </div>
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
