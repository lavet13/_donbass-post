import { useState, Fragment, type ComponentProps, type FC } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDownIcon, X } from "lucide-react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip } from "@/components/ui/tooltip";
import * as AccessibleIconPrimitive from "@radix-ui/react-accessible-icon";
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import { useElementWidth } from "@/hooks/use-element-width";

type ValueType = { label: string; value: string | number; name: string }[];

const ComboboxField: FC<
  ComponentProps<"button"> & {
    searchEmptyMessage?: string;
    searchInputPlaceholder?: string;
    searchClearButtonTooltipMessage?: string;
    isLoading?: boolean;
    values?: [string, ValueType][];
    placeholder: string;
    label: string;
    selectedEntryClearTooltipMessage?: string;
    loadingMessage?: string;
    refetchErrorMessage?: string;
    refetch?: () => void;
  }
> = ({
  className,
  placeholder,
  label,
  searchEmptyMessage = "Не найдено.",
  searchInputPlaceholder = "Найти...",
  searchClearButtonTooltipMessage = "Очистить поле",
  refetchErrorMessage = "Не удалось загрузить данные.",
  refetch,
  values: entries = [],
  selectedEntryClearTooltipMessage = "Очистить выбор",
  isLoading = undefined,
  loadingMessage = "Подождите",
  "aria-label": ariaLabel,
  ...props
}) => {
  const {
    field,
    ariaDescribedBy,
    formItemId,
    formMessageId,
    error,
    defaultAriaLabel,
  } = useFieldAccessibility<string | number>({
    label,
    ariaLabel,
  });

  const [open, setOpen] = useState(false);
  const allEntries = entries.flatMap(([, items]) => items);
  const selectedEntry = allEntries.find(
    (entry) => entry.value === field.state.value,
  );

  const { elementRef: buttonRef, width: popoverWidth } =
    useElementWidth<HTMLButtonElement>({ dependencies: [open] });

  return (
    <FormItem>
      <FormLabel id={formItemId}>{label}</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            ref={buttonRef}
            className={cn(
              "dark:bg-input/30 dark:hover:bg-input/40 dark:active:bg-input/50",
              `justify-between`,
              open && "bg-secondary/90 dark:bg-input/50",
              className,
            )}
            id={formItemId}
            name={field.name}
            role="combobox"
            aria-label={defaultAriaLabel}
            aria-describedby={ariaDescribedBy}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-invalid={!!error}
            {...props}
          >
            <div className="flex shrink items-center min-w-0">
              {!selectedEntry ? (
                <span className="dark:text-muted-foreground truncate text-base md:text-sm">
                  {placeholder}
                </span>
              ) : (
                <span className="font-bold truncate text-base md:text-sm">
                  {selectedEntry.name}
                </span>
              )}
            </div>

            {/* Right side controls */}
            {selectedEntry && (
              <Tooltip content={selectedEntryClearTooltipMessage}>
                <span
                  tabIndex={0}
                  className="pointer-events-auto cursor-default shrink-0 inline-flex justify-center items-center size-6 rounded-full [&_svg]:size-3 hover:bg-popover-foreground/10 active:bg-popover-foreground/15 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  aria-label={selectedEntryClearTooltipMessage}
                  onClick={(e) => {
                    e.preventDefault();
                    field.handleChange("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      field.handleChange("");
                      buttonRef.current?.focus();
                    }
                  }}
                >
                  <AccessibleIconPrimitive.Root
                    label={selectedEntryClearTooltipMessage}
                  >
                    <X />
                  </AccessibleIconPrimitive.Root>
                </span>
              </Tooltip>
            )}
            <ChevronsUpDownIcon className="pointer-events-none ml-auto" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          role="listbox"
          sideOffset={2}
          style={{ width: `${popoverWidth}px` }}
          className={`p-0 border border-input`}
        >
          <Command>
            <CommandInput
              clearButton
              clearButtonTooltipMessage={searchClearButtonTooltipMessage}
              placeholder={searchInputPlaceholder}
            />
            <CommandList>
              {isLoading ? (
                <CommandLoading label={loadingMessage}>
                  {loadingMessage}
                </CommandLoading>
              ) : (
                <CommandEmpty>{searchEmptyMessage}</CommandEmpty>
              )}
              {entries.length !== 0 &&
                !isLoading &&
                entries.map(([heading, items], valuesIdx, entries) => (
                  <Fragment key={valuesIdx}>
                    <CommandGroup heading={heading}>
                      {items.map(({ label, value }) => (
                        <CommandItem
                          title={label}
                          className={cn(
                            value === field.state.value &&
                              "dark:bg-primary dark:data-[selected=true]:bg-primary/90 dark:hover:data-[selected=true]:bg-primary/90 dark:hover:data-[selected=true]:text-primary-foreground dark:active:data-[selected=true]:bg-primary/80 dark:text-primary-foreground bg-primary data-[selected=true]:bg-primary/90 hover:data-[selected=true]:bg-primary/90 active:data-[selected=true]:bg-primary/80 text-popover hover:data-[selected=true]:text-popover data-[selected=true]:text-popover",
                          )}
                          key={value}
                          value={value as string}
                          role="option"
                          aria-selected={value === field.state.value}
                          onSelect={() => {
                            field.handleChange(value);
                            setOpen(false);
                          }}
                        >
                          <span
                            className={cn(
                              value === field.state.value && "font-bold",
                            )}
                          >
                            {label}
                          </span>
                          <CheckIcon
                            className={cn(
                              "ml-auto size-4 text-popover dark:text-primary-foreground",
                              value === field.state.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {valuesIdx !== entries.length - 1 && <CommandSeparator />}
                  </Fragment>
                ))}

              {!entries.length && !isLoading && refetch && (
                <p className="flex flex-col items-center justify-center py-2 text-center text-sm text-muted-foreground">
                  {refetchErrorMessage}
                  <Button variant="secondary" size="xs" onClick={refetch}>
                    Повторить запрос
                  </Button>
                </p>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default ComboboxField;
