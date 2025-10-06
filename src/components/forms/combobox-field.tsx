import { useState, Fragment, type ComponentProps, type FC } from "react";
import {
  Button,
  Tooltip,
  VisuallyHidden,
  Popover,
  AccessibleIcon,
} from "@radix-ui/themes";
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
import { useFieldAccessibility } from "@/hooks/use-field-accessibility";
import { useMeasure } from "@/hooks/use-measure";
import {
  Drawer,
  DrawerContent,
  DrawerHandle,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

type EntryType = { label: string; value: string | number; name?: string };

const ComboboxGroupField: FC<
  ComponentProps<typeof Button> & {
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
        variant="surface"
        color="gray"
        ref={buttonRef}
        className={cn(
          `justify-between [&_svg]:size-4`,
          `aria-invalid:shadow-[inset_0_0_0_1px_var(--red-8)]`,
          open && "bg-grayA-4",
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
            <span className="truncate text-sm">{placeholder}</span>
          ) : (
            <span className="text-grayA-12 font-medium truncate text-sm">
              {selectedEntry.name || selectedEntry.label}
            </span>
          )}
        </div>

        {/* Clear the selected entry */}
        {selectedEntry && (
          <Tooltip content={selectedEntryClearTooltipMessage}>
            <span
              tabIndex={0}
              className="pointer-events-auto shrink-0 rounded-full [&_svg]:size-5! rt-reset rt-BaseButton rt-r-size-1 rt-variant-ghost rt-IconButton"
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
              <AccessibleIcon label={selectedEntryClearTooltipMessage}>
                <X />
              </AccessibleIcon>
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
          {...(modal ? { inputContainer: "bg-gray-2 rounded-t-sm" } : {})}
          shouldFocus={shouldFocus}
          clearButton
          clearButtonTooltipMessage={searchClearButtonTooltipMessage}
          placeholder={searchInputPlaceholder}
        />
        <CommandList
          scrollProps={{ type: modal ? "auto" : "always" }}
          className={cn(modal && `h-auto max-h-fit`)}
        >
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
                          "ml-auto size-4",
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
            <p className="flex flex-col items-center justify-center py-2 text-center text-sm text-grayA-11">
              {refetchErrorMessage}
              <Button
                variant="surface"
                radius="full"
                size="2"
                onClick={refetch}
              >
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
            className="rounded-t-lg w-full h-full! lg:max-h-full max-h-[calc(100vh-0.75rem)] top-3 lg:top-0 border border-grayA-6"
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
                    className="hidden text-red-11 hover:bg-red-3 active:bg-red-4 absolute top-1 left-1 ml-auto pointer-events-auto cursor-pointer shrink-0 lg:inline-flex justify-center items-center size-8 rounded-full [&_svg]:size-4 outline-none focus-visible:ring-red-8 focus-visible:ring-[2px]"
                    aria-label="Закрыть окно"
                    type="button"
                    onClick={() => setOpen(false)}
                  >
                    <AccessibleIcon label="Закрыть модальное окно">
                      <X />
                    </AccessibleIcon>
                  </button>
                </Tooltip>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger>{renderTrigger()}</Popover.Trigger>
          <Popover.Content
            role="listbox"
            sideOffset={2}
            style={{ width: `${bounds?.width}px` }}
            className={`p-0 rounded-sm`}
          >
            {renderContent()}
          </Popover.Content>
        </Popover.Root>
      )}
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

export default ComboboxGroupField;
