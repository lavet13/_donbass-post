import { cn } from "@/lib/utils";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type { ComponentProps, FC } from "react";
import { Label } from "@/components/ui/label";

const RadioGroupRoot: FC<ComponentProps<typeof RadioGroupPrimitive.Root>> = ({
  className,
  ...props
}) => {
  return (
    <RadioGroupPrimitive.Root className={cn("flex", className)} {...props} />
  );
};

const RadioGroupItem: FC<ComponentProps<typeof RadioGroupPrimitive.Item>> = ({
  className,
  ...props
}) => {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "group relative cursor-pointer md:text-sm text-base leading-none text-center py-2 px-4 -mr-px",
        "hover:cursor-pointer first-of-type:rounded-l-sm last-of-type:rounded-r-sm overflow-hidden",
        "data-[state=unchecked]:hover:bg-accent/80 data-[state=unchecked]:active:bg-accent/95",
        "data-[state=unchecked]:border data-[state=unchecked]:border-accent",
        className,
      )}
      {...props}
    />
  );
};

const RadioGroupIndicator: FC<
  ComponentProps<typeof RadioGroupPrimitive.Indicator>
> = ({ className, ...props }) => {
  return (
    <RadioGroupPrimitive.Indicator
      className={cn(
        "absolute top-0 left-0 flex items-center justify-center w-full h-full",
        "bg-primary/90 group-hover:bg-primary/95 group-active:bg-primary",
        "border border-accent group-first-of-type:rounded-l-sm group-last-of-type:rounded-r-sm",
        className,
      )}
      {...props}
    />
  );
};

const RadioGroupLabel: FC<ComponentProps<typeof Label>> = ({
  className,
  ...props
}) => {
  return (
    <Label
      className={cn(
        "cursor-pointer relative z-1 text-accent-foreground",
        "group-data-[state=checked]:text-primary-foreground",
        "relative group-active:top-[1px]",
        className,
      )}
      {...props}
    />
  );
};

export { RadioGroupRoot, RadioGroupItem, RadioGroupIndicator, RadioGroupLabel };
