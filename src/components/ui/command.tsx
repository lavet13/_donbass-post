import { cn } from "@/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";
import type { ComponentProps, FC } from "react";

const Command: FC<ComponentProps<typeof CommandPrimitive>> = ({
  className,
  loop = false,
  ...props
}) => {
  return (
    <CommandPrimitive
      data-slot="command"
      loop={loop}
      className={cn("", className)}
      {...props}
    />
  );
};

const CommandList: FC<ComponentProps<typeof CommandPrimitive.List>> = ({
  className,
  ...props
}) => {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 transition-[height] duration-100 ease-out overflow-x-hidden overflow-y-auto outline-none",
        className,
      )}
      {...props}
    />
  );
};

const CommandGroup: FC<ComponentProps<typeof CommandPrimitive.Group>> = ({
  className,
  ...props
}) => {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "[&_[cmdk-group-heading]]:px-1.5 [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        "text-foreground overflow-hidden p-1",
        className,
      )}
      {...props}
    />
  );
};

const CommandItem: FC<ComponentProps<typeof CommandPrimitive.Item>> = ({
  className,
  ...props
}) => {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary data-[selected=true]:active:bg-primary/15",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "[&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 select-none outline-hidden text-sm",
        className,
      )}
      {...props}
    />
  );
};

const CommandSeparator: FC<
  ComponentProps<typeof CommandPrimitive.Separator>
> = ({ className, ...props }) => {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  );
};

const CommandInput: FC<ComponentProps<typeof CommandPrimitive.Input>> = ({
  className,
  ...props
}) => {
  return (
    <div className="flex h-9 items-center gap-2 border-b-4 border-primary/10 px-3">
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden",
          "placeholder:text-muted-foreground caret-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
};

const CommandEmpty: FC<ComponentProps<typeof CommandPrimitive.Empty>> = ({
  className,
  ...props
}) => {
  return (
    <CommandPrimitive.Empty
      className={cn("text-sm text-center py-6", className)}
      {...props}
    />
  );
};

const CommandShortcut: FC<ComponentProps<"span">> = ({
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
};

export {
  Command,
  CommandGroup,
  CommandList,
  CommandItem,
  CommandSeparator,
  CommandEmpty,
  CommandShortcut,
  CommandInput,
};
