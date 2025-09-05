import { cn } from "@/lib/utils";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { ComponentProps, FC } from "react";

const Select: FC<ComponentProps<typeof SelectPrimitive.Root>> = (props) => {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
};

const SelectTrigger: FC<ComponentProps<typeof SelectPrimitive.Trigger>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "inline-flex items-center justify-between gap-1",
        "px-[15px] h-[35px] sm:text-sm text-base whitespace-nowrap leading-none rounded-lg border border-accent bg-transparent hover:bg-accent/40 text-accent-foreground",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-accent-foreground",
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
};

const SelectValue: FC<ComponentProps<typeof SelectPrimitive.Value>> = (
  props,
) => {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
};

const SelectLabel: FC<ComponentProps<typeof SelectPrimitive.Label>> = ({
  className,
  ...props
}) => {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "px-[25px] text-xs text-muted-foreground leading-3 my-1",
        className,
      )}
      {...props}
    />
  );
};

const SelectItem: FC<ComponentProps<typeof SelectPrimitive.Item>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "group relative select-none",
        "leading-none sm:text-sm text-base text-accent-foreground rounded-lg",
        "flex justify-between items-center h-[30px] sm:h-[25px] pr-4 gap-1 pl-2",
        "data-[disabled]:pointer-events-none data-[disabled]:text-muted-foreground",
        "data-[highlighted]:outline-none data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <CheckIcon className="group-data-[state=checked]:inline-flex hidden size-4" />
    </SelectPrimitive.Item>
  );
};

const SelectGroup: FC<ComponentProps<typeof SelectPrimitive.Group>> = ({
  className,
  ...props
}) => {
  return <SelectPrimitive.Group data-slot="select-group" className={cn("", className)} {...props} />;
};

const SelectContent: FC<ComponentProps<typeof SelectPrimitive.Content>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "overflow-hidden rounded-lg bg-background shadow-md border border-input",
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />

        <SelectPrimitive.Viewport className={cn("p-[5px]")}>
          {children}
        </SelectPrimitive.Viewport>

        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
};

const SelectSeparator: FC<ComponentProps<typeof SelectPrimitive.Separator>> = ({
  className,
  ...props
}) => {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("h-[1px] bg-primary m-[5px]", className)}
      {...props}
    />
  );
};

const SelectScrollUpButton: FC<
  ComponentProps<typeof SelectPrimitive.ScrollUpButton>
> = ({ className, ...props }) => {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex items-center justify-center py-1 cursor-default text-primary",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
};

const SelectScrollDownButton: FC<
  ComponentProps<typeof SelectPrimitive.ScrollDownButton>
> = ({ className, ...props }) => {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex items-center justify-center py-1 cursor-default text-primary",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
};

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectContent,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectSeparator,
};
