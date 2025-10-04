import { useControllableState } from "@/hooks/use-controllable-state";
import { cn } from "@/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon, X } from "lucide-react";
import { useEffect, useRef, type ComponentProps, type FC } from "react";
import { IconButton, ScrollArea, Spinner, Tooltip, type ScrollAreaProps } from "@radix-ui/themes";
import { AccessibleIcon } from "@radix-ui/themes";
import mergeRefs from "@/hooks/merge-refs";

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

const CommandList: FC<
  ComponentProps<typeof CommandPrimitive.List> & {
    listStyles?: string;
    scrollProps?: ScrollAreaProps;
  }
> = ({ className, scrollProps, listStyles, ...props }) => {
  return (
    <ScrollArea
      className={cn("max-h-[300px] h-[40vh]", className)}
      scrollbars="vertical"
      type="always"
      {...scrollProps}
    >
      <CommandPrimitive.List
        data-slot="command-list"
        className={cn(
          "scroll-py-1 transition-[height] duration-100 ease-out overflow-x-hidden overflow-y-auto outline-none pl-rx-1 pr-rx-3",
          listStyles,
        )}
        {...props}
      />
    </ScrollArea>
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
        "[&_[cmdk-group-heading]]:px-1.5 [&_[cmdk-group-heading]]:text-grayA-11 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
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
        "hover:data-[selected=true]:bg-redA-10 data-[selected=true]:[&_svg:not([class*='text-'])]:text-red-contrast hover:data-[selected=true]:text-red-contrast active:data-[selected=true]:filter-(--base-button-solid-active-filter) data-[selected=true]:bg-redA-9 data-[selected=true]:text-red-contrast",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "[&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-gray-12 hover:[&_svg:not([class*='text-'])]:text-red-contrast",
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 select-none outline-hidden",
        "text-sm leading-[15px] not-first:mt-0.5",
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
      className={cn("text-grayA-11 py-8", className)}
      {...props}
    >
      <div className={"flex text-sm gap-2 items-center justify-center"}>
        <Spinner />
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
      className={cn("bg-grayA-7 -mx-1 h-px", className)}
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
        "sticky z-10 top-0 flex h-8 items-center gap-2 border-b border-grayA-6 px-3 pr-2",
        inputContainer,
      )}
    >
      <SearchIcon className="size-4 shrink-0 opacity-50 text-gray-11" />
      <CommandPrimitive.Input
        data-slot="command-input"
        ref={mergeRefs(inputRef, ref)}
        value={value}
        onValueChange={setValue}
        className={cn(
          "flex h-[30px] w-full bg-transparent py-3 text-sm outline-hidden",
          "placeholder:text-grayA-11 caret-red-8 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      {clearButton && value && (
        <Tooltip content={clearButtonTooltipMessage}>
          <IconButton
            size="2"
            variant="ghost"
            radius="full"
            data-slot="command-input-clear"
            className="shrink-0 [&_svg]:size-4.5 text-red-11 hover:bg-redA-3 active:bg-redA-4 rounded-full p-[6px] box-content h-fit"
            onKeyDown={handleKeyDown}
            onClick={handleClear}
            type="button"
            aria-label={clearButtonTooltipMessage}
          >
            <AccessibleIcon label={clearButtonTooltipMessage}>
              <X />
            </AccessibleIcon>
          </IconButton>
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
      className={cn("text-grayA-11 ml-auto text-xs tracking-widest", className)}
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
