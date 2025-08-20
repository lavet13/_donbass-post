import { cn } from "@/lib/utils";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type ComponentProps, type FC } from "react";

const Tabs: FC<ComponentProps<typeof TabsPrimitive.Root>> = ({
  className,
  ...props
}) => {
  return (
    <TabsPrimitive.Root
      className={cn("flex flex-col max-w-[300px] w-full", className)}
      {...props}
    />
  );
};

const TabsList: FC<ComponentProps<typeof TabsPrimitive.List>> = ({
  className,
  ...props
}) => {
  return (
    <TabsPrimitive.List
      className={cn("shrink-0 flex border-b border-input", className)}
      {...props}
    />
  );
};

const TabsTrigger: FC<ComponentProps<typeof TabsPrimitive.Trigger>> = ({
  className,
  value,
  ...props
}) => {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        "relative flex-1 flex items-center justify-center px-5 h-[45px] text-sm outline-none",
        "leading-none select-none",
        "hover:text-primary data-[state=active]:text-primary",
        "data-[state=active]:[box-shadow:inset_0_-1px_0_0_currentColor,_0_1px_0_0_currentColor]",
        "first:rounded-tl-md last:rounded-tr-md bg-popover",
        className,
      )}
      {...props}
    >
    </TabsPrimitive.Trigger>
  );
};

const TabsContent: FC<ComponentProps<typeof TabsPrimitive.Content>> = ({
  className,
  ...props
}) => {
  return (
    <TabsPrimitive.Content
      className={cn(
        "grow p-5 bg-popover outline-none focus-visible:[box-shadow:0_0_0_2px_var(--color-primary)]",
        "rounded-bl-md rounded-br-md",
        className,
      )}
      {...props}
    />
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
