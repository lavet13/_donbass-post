import { useControllableState } from "@/hooks/use-controllable-state";
import { cn } from "@/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon, X } from "lucide-react";
import { useEffect, useRef, type ComponentProps, type FC } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import * as AccessibleIconPrimitive from "@radix-ui/react-accessible-icon";
import mergeRefs from "@/hooks/merge-refs";
import { Icons } from "../icons";

// https://github.com/pacocoursey/cmdk?tab=readme-ov-file
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
        "scroll-py-1 transition-[height] duration-100 ease-out overflow-x-hidden overflow-y-auto outline-none max-h-[300px] h-[40vh]",
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
        "hover:data-[selected=true]:bg-primary/90 hover:data-[selected=true]:text-primary-foreground dark:hover:data-[selected=true]:bg-primary/90 dark:data-[selected=true]:bg-primary/90 active:data-[selected=true]:bg-primary dark:active:data-[selected=true]:bg-primary data-[selected=true]:bg-primary/90 data-[selected=true]:text-primary-foreground",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "[&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-primary-foreground",
        "relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 select-none outline-hidden text-sm",
        "md:text-sm text-base md:leading-4 leading-5 not-first:mt-0.5",
        className,
      )}
      {...props}
    />
  );
};

const CommandLoading: FC<ComponentProps<typeof CommandPrimitive.Loading>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <CommandPrimitive.Loading
      data-slot="command-loading"
      className={cn("text-muted-foreground py-8", className)}
      {...props}
    >
      <div className={"flex text-sm gap-2 items-center justify-center"}>
        <Icons.spinner className="size-4" />
        {children}
      </div>
    </CommandPrimitive.Loading>
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

const CommandInput: FC<
  ComponentProps<typeof CommandPrimitive.Input> & {
    clearButton?: boolean;
    clearButtonTooltipMessage?: string;
    inputContainer?: HTMLInputElement["className"];
    shouldFocus?: boolean;
  }
> = ({
  className,
  ref,
  value: valueProp,
  clearButton = false,
  clearButtonTooltipMessage = "Очистить поле",
  inputContainer,
  shouldFocus = false,
  onValueChange,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [value, setValue] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  });

  const handleClear = () => {
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === "") {
      e.preventDefault();
      handleClear();
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (inputRef.current && shouldFocus) {
      inputRef.current.focus();
    }
  }, [inputRef.current]);

  return (
    <div
      className={cn(
        "sticky z-10 top-0 flex h-9 items-center gap-2 border-b border-border px-3 pr-1",
        inputContainer,
      )}
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        ref={mergeRefs(inputRef, ref)}
        value={value}
        onValueChange={setValue}
        className={cn(
          "flex h-10 w-full rounded-lg bg-transparent py-3 text-sm outline-hidden",
          "placeholder:text-muted-foreground caret-primary disabled:cursor-not-allowed disabled:opacity-50",
          "text-base md:text-sm",
          className,
        )}
        {...props}
      />
      {clearButton && value && (
        <Tooltip content={clearButtonTooltipMessage}>
          <button
            data-slot="command-input-clear"
            className="shrink-0 inline-flex justify-center items-center size-6 rounded-full [&_svg]:size-3 hover:bg-secondary/60 active:bg-secondary/70 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            onKeyDown={handleKeyDown}
            onClick={handleClear}
            type="button"
            aria-label={clearButtonTooltipMessage}
          >
            <AccessibleIconPrimitive.Root label={clearButtonTooltipMessage}>
              <X />
            </AccessibleIconPrimitive.Root>
          </button>
        </Tooltip>
      )}
    </div>
  );
};

const CommandEmpty: FC<ComponentProps<typeof CommandPrimitive.Empty>> = ({
  className,
  ...props
}) => {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
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
      data-slot="command-shortcut"
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
  CommandLoading,
};
