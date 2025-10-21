import { cn } from "@/lib/utils";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type { ComponentProps, FC } from "react";
import { Label } from "@/components/ui/label";

const RadioGroup: FC<ComponentProps<typeof RadioGroupPrimitive.Root>> = ({
  className,
  ...props
}) => {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("flex h-[30px]", className)}
      {...props}
    />
  );
};

const RadioGroupItem: FC<ComponentProps<typeof RadioGroupPrimitive.Item>> = ({
  className,
  ...props
}) => {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        "group relative -mr-px cursor-pointer px-4 py-2 text-center text-base leading-none md:text-sm",
        "overflow-hidden first-of-type:rounded-l-full last-of-type:rounded-r-full hover:cursor-pointer hover:data-[state=unchecked]:z-1",
        "data-[state=unchecked]:hover:bg-accentA-3 data-[state=unchecked]:active:bg-accentA-5 data-[state=unchecked]:[box-shadow:inset_0_0_0_1px_var(--gray-a7)] data-[state=unchecked]:hover:[box-shadow:inset_0_0_0_1px_var(--accent-a8)] data-[state=unchecked]:active:[box-shadow:inset_0_0_0_1px_var(--accent-a8)]",
        "focus-visible:outline-accent-8 -outline-offset-1 focus-visible:z-1 focus-visible:outline-[2px]",
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
        "absolute top-0 left-0 flex h-full w-full items-center justify-center",
        "bg-accentA-5 border-accentA-8 border",
        "group-first-of-type:rounded-l-full group-last-of-type:rounded-r-full",
        className,
      )}
      {...props}
    />
  );
};

const RadioGroupLabel: FC<ComponentProps<typeof Label>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <Label
      className={cn(
        "relative",
        "group-hover:text-accentA-11 group-active:text-accentA-11 group-data-[state=checked]:text-accent-11 text-grayA-11 font-regular relative cursor-pointer",
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
    </Label>
  );
};

export { RadioGroup, RadioGroupItem, RadioGroupIndicator, RadioGroupLabel };
