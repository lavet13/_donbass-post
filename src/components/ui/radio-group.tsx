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
        "group relative cursor-pointer md:text-sm text-base leading-none text-center py-2 px-4 -mr-px",
        "hover:cursor-pointer first-of-type:rounded-l-full last-of-type:rounded-r-full overflow-hidden hover:data-[state=unchecked]:z-1",
        "data-[state=unchecked]:[box-shadow:inset_0_0_0_1px_var(--gray-a7)] data-[state=unchecked]:hover:[box-shadow:inset_0_0_0_1px_var(--accent-a8)] data-[state=unchecked]:hover:bg-accentA-3 data-[state=unchecked]:active:[box-shadow:inset_0_0_0_1px_var(--accent-a8)] data-[state=unchecked]:active:bg-accentA-5",
        "-outline-offset-1 focus-visible:outline-accent-8 focus-visible:outline-[2px] focus-visible:z-1",
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
        "bg-accentA-5 border border-accentA-8",
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
        "cursor-pointer relative group-hover:text-accentA-11 group-active:text-accentA-11 group-data-[state=checked]:text-accent-11 text-grayA-11 font-regular",
        "relative group-active:top-[1px]",
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
    </Label>
  );
};

export { RadioGroup, RadioGroupItem, RadioGroupIndicator, RadioGroupLabel };
