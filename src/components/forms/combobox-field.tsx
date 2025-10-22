import {
  useState,
  Fragment,
  type ComponentProps,
  type FC,
  useEffect,
  useCallback,
} from "react";
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
import { isMobile as isMobileDevice } from "react-device-detect";

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
  modal = modal || isMobileDevice;

  const [buttonRef, bounds] = useMeasure<HTMLButtonElement>({
    dependencies: [isMobile],
  });

  const scrollIntoButton = () => {
    if (!modal) return;

    const headerHeightStr = getComputedStyle(document.documentElement)
      .getPropertyValue("--header-height")
      .trim();

    let headerHeightPx;

    if (headerHeightStr.endsWith("rem")) {
      const remValue = parseFloat(headerHeightStr);
      const rootFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      headerHeightPx = remValue * rootFontSize;
    } else {
      headerHeightPx = parseFloat(headerHeightStr);
    }

    const buttonTop =
      buttonRef.current!.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      behavior: "smooth",
      top: buttonTop - headerHeightPx - 30,
    });
  };

  const [isFocused, setIsFocused] = useState(false);

  const handleToggle = () => {
    setOpen((open) => !open);
    setIsFocused(false);
  };

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
        <div className="flex min-w-0 shrink items-center">
          {!selectedEntry ? (
            <span className="truncate text-sm">{placeholder}</span>
          ) : (
            <span className="text-grayA-12 truncate text-sm font-medium">
              {selectedEntry.name || selectedEntry.label}
            </span>
          )}
        </div>

        {/* Clear the selected entry */}
        {selectedEntry && (
          <Tooltip content={selectedEntryClearTooltipMessage}>
            <span
              tabIndex={0}
              className="rt-reset rt-BaseButton rt-r-size-1 rt-variant-ghost rt-IconButton pointer-events-auto shrink-0 rounded-full [&_svg]:size-5!"
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

  const [, setSelectedDepartmentRef] = useScrollToSelectedItem();

  const renderContent = (props: { shouldFocus?: boolean } = {}) => {
    const { shouldFocus = false } = props;

    return (
      <Command>
        <CommandInput
          {...(modal ? { inputContainer: "bg-gray-2 rounded-t-sm" } : {})}
          isModal={modal}
          focus={isFocused}
          onFocusChange={setIsFocused}
          shouldFocus={shouldFocus}
          clearButton
          clearButtonTooltipMessage={searchClearButtonTooltipMessage}
          placeholder={searchInputPlaceholder}
        />
        <CommandList
          scrollProps={{ type: modal ? "auto" : "always" }}
          className={cn(modal && `h-auto max-h-fit`)}
        >
          {isLoading && (
            <CommandLoading label={loadingMessage}>
              {loadingMessage}
            </CommandLoading>
          )}
          {!!entries.length && !isLoading && (
            <CommandEmpty>{searchEmptyMessage}</CommandEmpty>
          )}
          {entries.length !== 0 &&
            !isLoading &&
            entries.map(({ label, items }, valuesIdx, entries) => (
              <Fragment key={valuesIdx}>
                <CommandGroup heading={label}>
                  {items.map(({ label, value }) => {
                    return (
                      <CommandItem
                        title={label}
                        key={value}
                        value={value as string}
                        role="option"
                        data-selected={value === field.state.value}
                        data-status={
                          field.state.value === value ? true : undefined
                        }
                        ref={(node) => {
                          if (value === field.state.value) {
                            setSelectedDepartmentRef(node);
                          }
                        }}
                        onSelect={() => {
                          field.handleChange(value);
                          setOpen(false);
                          scrollIntoButton();
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
                    );
                  })}
                </CommandGroup>
                {valuesIdx !== entries.length - 1 && <CommandSeparator />}
              </Fragment>
            ))}
          {!entries.length && !isLoading && refetch && (
            <p className="text-grayA-11 flex flex-col items-center justify-center py-2 text-center text-sm">
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
        <Drawer open={open} onOpenChange={handleToggle}>
          <DrawerTrigger asChild>{renderTrigger()}</DrawerTrigger>
          <DrawerContent
            aria-describedby={undefined}
            className={cn(
              "border-grayA-6 max-h-[80svh] w-full rounded-t-lg border",
              !isFocused && "right-0 bottom-0 left-0",
              isFocused && "top-0 right-0 max-h-[100svh] left-0 rounded-t-none",
            )}
            role="listbox"
          >
            {!isFocused && <DrawerHandle />}
            <div className="flex w-full flex-1 overflow-y-auto">
              <div className="sticky top-0 shrink grow" />
              <div className="w-full max-w-4xl shrink-1">
                <VisuallyHidden>
                  <DrawerTitle>{searchInputPlaceholder}</DrawerTitle>
                </VisuallyHidden>
                {renderContent({ shouldFocus: false })}
              </div>
              <div
                className="hover:bg-secondary/10 sticky top-0 shrink grow cursor-pointer"
                onClick={handleToggle}
              >
                <Tooltip content="Закрыть модальное окно">
                  <button
                    className="text-red-11 hover:bg-red-3 active:bg-red-4 focus-visible:ring-red-8 pointer-events-auto absolute top-1 left-1 ml-auto hidden size-8 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-[2px] lg:inline-flex [&_svg]:size-4"
                    aria-label="Закрыть окно"
                    type="button"
                    onClick={handleToggle}
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
        <Popover.Root open={open} onOpenChange={handleToggle}>
          <Popover.Trigger>{renderTrigger()}</Popover.Trigger>
          <Popover.Content
            role="listbox"
            sideOffset={2}
            style={{ width: `${bounds?.width}px` }}
            className="rounded-sm p-0"
          >
            {renderContent()}
          </Popover.Content>
        </Popover.Root>
      )}
      <FormMessage id={formMessageId} />
    </FormItem>
  );
};

function useScrollToSelectedItem<T extends HTMLElement = HTMLDivElement>() {
  const [selectedDepartmentRef, setSelectedDepartmentRef] = useState<T | null>(
    null,
  );

  useEffect(() => {
    if (!selectedDepartmentRef) return;

    const scrollInto = async () => {
      // First scroll
      selectedDepartmentRef.scrollIntoView({
        behavior: "instant",
        block: "center",
      });

      // Trigger cmdk's internal hover state
      const pointerOver = new PointerEvent("pointerover", {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: "mouse",
      });

      const pointerMove = new PointerEvent("pointermove", {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: "mouse",
      });

      selectedDepartmentRef.dispatchEvent(pointerOver);
      selectedDepartmentRef.dispatchEvent(pointerMove);
    };

    void scrollInto();

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-status"
        ) {
          const target = mutation.target as HTMLElement;
          if (target.getAttribute("data-status") === "true") {
            void scrollInto();
            break;
          }
        }
      }
    });

    const cardList = document.querySelector("[cmdk-list-sizer]");
    if (cardList) {
      mutationObserver.observe(cardList, {
        subtree: true,
        attributeFilter: ["data-status"],
      });
    }

    return () => {
      mutationObserver.disconnect();
    };
  }, [selectedDepartmentRef]);

  return [selectedDepartmentRef, setSelectedDepartmentRef] as const;
}

export default ComboboxGroupField;
