import { useControllableState } from "@/hooks/use-controllable-state";
import { cn } from "@/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon, X } from "lucide-react";
import { useEffect, useRef, type ComponentProps, type FC } from "react";
import {
  IconButton,
  ScrollArea,
  Spinner,
  Tooltip,
  type ScrollAreaProps,
} from "@radix-ui/themes";
import { AccessibleIcon } from "@radix-ui/themes";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { createContext } from "@/hooks/create-context";

/* -------------------------------------------------------------------------------------------------
 * Command
 * -----------------------------------------------------------------------------------------------*/

const COMMAND_NAME = "Command";

type CommandContextValue = {
  listRef: React.RefObject<HTMLDivElement | null>;
  commandRef: React.RefObject<HTMLDivElement | null>;
};

const [CommandProvider, useCommandContext] =
  createContext<CommandContextValue>(COMMAND_NAME);

/* -------------------------------------------------------------------------------------------------
 * CommandRoot
 * -----------------------------------------------------------------------------------------------*/

// https://github.com/pacocoursey/cmdk?tab=readme-ov-file
const Command: FC<ComponentProps<typeof CommandPrimitive>> = ({
  className,
  loop = false,
  ...props
}) => {
  const commandRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  return (
    <CommandProvider commandRef={commandRef} listRef={listRef}>
      <CommandPrimitive
        ref={commandRef}
        data-slot="command"
        loop={loop}
        className={cn("", className)}
        {...props}
      />
    </CommandProvider>
  );
};
Command.displayName = COMMAND_NAME;

const COMMAND_LIST_NAME = "CommandList";

const CommandList: FC<
  ComponentProps<typeof CommandPrimitive.List> & {
    listStyles?: string;
    scrollProps?: ScrollAreaProps;
    ref?: React.RefObject<HTMLDivElement>;
  }
> = ({ className, scrollProps, listStyles, ref, ...props }) => {
  const context = useCommandContext(COMMAND_LIST_NAME);
  const composedRefs = useComposedRefs(ref, context.listRef);

  return (
    <ScrollArea
      className={cn("", className)}
      scrollbars="vertical"
      type="always"
      {...scrollProps}
    >
      <CommandPrimitive.List
        ref={composedRefs}
        data-slot="command-list"
        className={cn(
          "pl-rx-1 pr-rx-3 scroll-py-1 overflow-x-hidden transition-[height] duration-100 ease-out outline-none",
          listStyles,
        )}
        {...props}
      />
    </ScrollArea>
  );
};
CommandList.displayName = COMMAND_LIST_NAME;

const CommandGroup: FC<ComponentProps<typeof CommandPrimitive.Group>> = ({
  className,
  ...props
}) => {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "[&_[cmdk-group-heading]]:text-grayA-11 [&_[cmdk-group-heading]]:px-1.5 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
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
        "hover:data-[selected=true]:bg-redA-10 data-[selected=true]:[&_svg:not([class*='text-'])]:text-red-contrast hover:data-[selected=true]:text-red-contrast data-[selected=true]:bg-redA-9 data-[selected=true]:text-red-contrast active:data-[selected=true]:filter-(--base-button-solid-active-filter)",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "[&_svg:not([class*='text-'])]:text-gray-12 hover:[&_svg:not([class*='text-'])]:text-red-contrast [&_svg:not([class*='size-'])]:size-4",
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 outline-hidden select-none",
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
      <div className="flex items-center justify-center gap-2 text-sm">
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

const COMMAND_INPUT_NAME = "CommandInput";
const CommandInput: FC<
  ComponentProps<typeof CommandPrimitive.Input> & {
    clearButton?: boolean;
    clearButtonTooltipMessage?: string;
    inputContainer?: HTMLInputElement["className"];
    shouldScroll?: boolean;
    shouldFocusOnMount?: boolean;
  }
> = ({
  className,
  ref,
  value: valueProp,
  clearButton = false,
  clearButtonTooltipMessage = "Очистить поле",
  inputContainer,
  shouldFocusOnMount = false,
  shouldScroll = false,
  onValueChange,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const context = useCommandContext(COMMAND_INPUT_NAME);

  const composedRefs = useComposedRefs(ref, inputRef);

  const [value, setValue] = useControllableState({
    defaultProp: "",
    prop: valueProp,
    onChange: onValueChange,
    caller: COMMAND_INPUT_NAME,
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
    const input = inputRef.current;
    if (!input) return;

    if (shouldFocusOnMount) {
      input.focus();
    }

    return () => {
      if (shouldFocusOnMount) {
        input.blur();
      }
    };
  }, [shouldFocusOnMount]);

  // Maintaining the scroll position at the top when searching for specific item
  useEffect(() => {
    const input = inputRef.current;
    if (!input || !shouldScroll) return;

    const handleInput = () => {
      setTimeout(() => {
        if (context.listRef.current) {
          context.listRef.current.scrollIntoView({
            block: "start",
            behavior: "instant",
            inline: "start",
          });
        }
        if (context.commandRef.current) {
          context.commandRef.current.scrollIntoView({
            block: "start",
            behavior: "instant",
            inline: "start",
          });
        }
      }, 0);
    };

    input.addEventListener("input", handleInput);

    return () => {
      input.removeEventListener("input", handleInput);
    };
  }, [context.listRef, context.commandRef, shouldScroll]);

  return (
    <div
      className={cn(
        "border-grayA-6 sticky top-0 z-10 flex h-8 items-center gap-2 border-b px-3 pr-0.5",
        inputContainer,
      )}
    >
      <SearchIcon className="text-gray-11 size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        ref={composedRefs}
        value={value}
        onValueChange={setValue}
        className={cn(
          "flex h-[30px] w-full bg-transparent py-3 text-sm outline-hidden",
          "placeholder:text-grayA-11 caret-accent-7 dark:caret-accent-11 disabled:cursor-not-allowed disabled:opacity-50",
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
            className="text-red-11 hover:bg-redA-3 active:bg-redA-4 mr-px box-content h-fit shrink-0 rounded-full p-[6px] [&_svg]:size-4.5"
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
CommandInput.displayName = COMMAND_INPUT_NAME;

const CommandEmpty: FC<ComponentProps<typeof CommandPrimitive.Empty>> = ({
  className,
  ...props
}) => {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-6 text-center text-sm", className)}
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
