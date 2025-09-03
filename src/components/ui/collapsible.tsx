import { cn } from "@/lib/utils";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import type { ComponentProps, FC } from "react";

const Collapsible: FC<ComponentProps<typeof CollapsiblePrimitive.Root>> = (
  props,
) => {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
};

const CollapsibleTrigger: FC<
  ComponentProps<typeof CollapsiblePrimitive.Trigger>
> = ({ className, ...props }) => {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn("", className)}
      {...props}
    />
  );
};

const CollapsibleContent: FC<
  ComponentProps<typeof CollapsiblePrimitive.Content>
> = ({ className, ...props }) => {
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-content"
      className={cn(
        "overflow-hidden",
        "data-[state=open]:animate-collapsible-slide-down",
        "data-[state=closed]:animate-collapsible-slide-up",
        className,
      )}
      {...props}
    />
  );
};

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
