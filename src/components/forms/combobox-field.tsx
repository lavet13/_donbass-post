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
import { useMeasure } from "@/hooks/use-measure";
import {
  Drawer,
  DrawerContent,
  DrawerHandle,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { useMediaQuery } from "@/hooks/use-media-query";

type EntryType = { label: string; value: string | number; name?: string };

const ComboboxGroupField: FC<
  ComponentProps<"button"> & {
    searchEmptyMessage?: string;
    searchInputPlaceholder?: string;
    searchClearButtonTooltipMessage?: string;
    isLoading?: boolean;
    values?: { label: string; items: EntryType[] }[];
    placeholder: string;
    label?: string;
    modal?: boolean;
    selectedEntryClearTooltipMessage?: string;
    loadingMessage?: string;
    refetchErrorMessage?: string;
    refetch?: () => void;
    ariaLabel?: string;
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
  "aria-label": ariaLabelProp,
  ariaLabel,
  modal = false,
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
    ariaLabel: ariaLabelProp || ariaLabel,
  });

  const [open, setOpen] = useState(false);
  const allEntries = entries.flatMap(({ items }) => items);
  const selectedEntry = allEntries.find(
    (entry) => entry.value === field.state.value,
  );

  const styles = getComputedStyle(document.documentElement);
  const sm = styles.getPropertyValue("--breakpoint-sm"); // 64rem
  const isMobile = useMediaQuery(`(max-width: ${sm})`);
  modal = modal || isMobile;

  const [buttonRef, bounds] = useMeasure<HTMLButtonElement>({
    dependencies: [isMobile],
  });

  const renderTrigger = () => {
    return (
      <Button
        variant="outline"
        ref={buttonRef}
        className={cn(
          "dark:bg-input/30 dark:hover:bg-input/40 dark:active:bg-input/50 border border-input",
          `justify-between`,
          open && "bg-primary/5 dark:bg-input/50",
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
        title={selectedEntry?.label}
        {...props}
      >
        <div className="flex shrink items-center min-w-0">
          {!selectedEntry ? (
            <span className="text-muted-foreground truncate text-base md:text-sm">
              {placeholder}
            </span>
          ) : (
            <span className="font-bold truncate text-base md:text-sm">
              {selectedEntry.name || selectedEntry.label}
            </span>
          )}
        </div>

        {/* Clear the selected entry */}
        {selectedEntry && (
          <Tooltip content={selectedEntryClearTooltipMessage}>
            <span
              tabIndex={0}
              className="pointer-events-auto cursor-default shrink-0 inline-flex justify-center items-center size-6 rounded-full [&_svg]:size-4.5! hover:bg-popover-foreground/10 active:bg-popover-foreground/15 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
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
    );
  };

  const renderContent = (props: { shouldFocus?: boolean } = {}) => {
    const { shouldFocus = false } = props;

    return (
      <Command>
        <CommandInput
          {...(modal ? { inputContainer: "bg-modal rounded-t-sm" } : {})}
          shouldFocus={shouldFocus}
          clearButton
          clearButtonTooltipMessage={searchClearButtonTooltipMessage}
          placeholder={searchInputPlaceholder}
        />
        <CommandList className={cn(modal && `h-auto max-h-fit`)}>
          {isLoading ? (
            <CommandLoading label={loadingMessage}>
              {loadingMessage}
            </CommandLoading>
          ) : (
            <CommandEmpty>{searchEmptyMessage}</CommandEmpty>
          )}
          {entries.length !== 0 &&
            !isLoading &&
            entries.map(({ label, items }, valuesIdx, entries) => (
              <Fragment key={valuesIdx}>
                <CommandGroup heading={label}>
                  {items.map(({ label, value }) => (
                    <CommandItem
                      title={label}
                      className={cn(
                        value === field.state.value &&
                          cn(
                            "dark:bg-primary dark:data-[selected=true]:bg-primary/90 dark:hover:data-[selected=true]:bg-primary/90 dark:hover:data-[selected=true]:text-primary-foreground dark:active:data-[selected=true]:bg-primary/80 dark:text-primary-foreground",
                            "bg-primary data-[selected=true]:bg-primary/90 hover:data-[selected=true]:bg-primary/90 active:data-[selected=true]:bg-primary/80 text-primary-foreground hover:data-[selected=true]:text-primary-foreground data-[selected=true]:text-primary-foreground",
                          ),
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
                          "ml-auto size-4 text-primary-foreground dark:text-primary-foreground",
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
    );
  };

  return (
    <FormItem>
      {label && <FormLabel htmlFor={formItemId}>{label}</FormLabel>}
      {modal ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>{renderTrigger()}</DrawerTrigger>
          <DrawerContent
            aria-describedby={undefined}
            className="rounded-t-lg h-full! lg:max-h-full max-h-[calc(100vh-0.75rem)] top-3 lg:top-0 border border-input"
            role="listbox"
          >
            <DrawerHandle />
            <div className="w-full overflow-y-auto flex flex-1">
              <div className="grow shrink sticky top-0" />
              <div className="shrink-1 max-w-4xl w-full">
                <VisuallyHidden>
                  <DrawerTitle>{searchInputPlaceholder}</DrawerTitle>
                </VisuallyHidden>
                {renderContent({ shouldFocus: true })}
              </div>
              <div
                className="grow shrink cursor-pointer sticky top-0 hover:bg-secondary/10"
                onClick={() => setOpen(false)}
              >
                <Tooltip content="Закрыть модальное окно">
                  <button
                    className="hidden text-secondary-foreground absolute top-1 left-1 ml-auto pointer-events-auto cursor-pointer shrink-0 lg:inline-flex justify-center items-center size-8 rounded-full [&_svg]:size-4 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    aria-label="Закрыть окно"
                    type="button"
                    onClick={() => setOpen(false)}
                  >
                    <AccessibleIconPrimitive.Root label="Закрыть модальное окно">
                      <X />
                    </AccessibleIconPrimitive.Root>
                  </button>
                </Tooltip>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{renderTrigger()}</PopoverTrigger>
          <PopoverContent
            role="listbox"
            sideOffset={2}
            style={{ width: `${bounds?.width}px` }}
            className={`p-0 bg-background`}
          >
            {renderContent()}
          </PopoverContent>
        </Popover>
      )}
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default ComboboxGroupField;
