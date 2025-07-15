import {
  useEffect,
  useRef,
  useState,
  Fragment,
  type ComponentProps,
  type FC,
} from "react";
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
import { useFieldContext } from "@/hooks/form-context";
import { CheckIcon, ChevronsUpDownIcon, X } from "lucide-react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type ValueType = { label: string; value: string | number; name: string }[];

type ValuesType =
  | {
      [x: string]: ValueType;
    }
  | undefined;

const ComboboxField: FC<
  ComponentProps<"button"> & {
    emptyMessage?: string;
    inputPlaceholder?: string;
    isLoading?: boolean;
    values?: ValuesType;
    label: string;
    formLabel: string;
    loadingMessage?: string;
    refetchMessage?: string;
    refetch?: () => void;
  }
> = ({
  className,
  label,
  formLabel,
  emptyMessage = "Не найдено.",
  refetchMessage = "Отделения не прогрузились.",
  inputPlaceholder = "Найти...",
  values = {},
  isLoading = undefined,
  loadingMessage = "Подождите",
  refetch,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [popoverWidth, setPopoverWidth] = useState(0);
  const field = useFieldContext<string | number>();
  const [open, setOpen] = useState(false);
  const entries = Object.entries(values ?? {});
  const allEntries = entries.flatMap(([, items]) => items);
  const selectedEntry = allEntries.find(
    (entry) => entry.value === field.state.value,
  );

  useEffect(() => {
    const updateWidth = () => {
      const width = buttonRef.current?.offsetWidth ?? 0;
      setPopoverWidth(width);
    };

    if (buttonRef.current) {
      updateWidth();
      window.addEventListener("resize", updateWidth);
    }

    return () => window.removeEventListener("resize", updateWidth);
  }, [open]);

  return (
    <FormItem>
      <FormLabel>{formLabel}</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            ref={buttonRef}
            className={cn(
              `justify-between`,
              open && "bg-secondary/90",
              className,
            )}
            role="combobox"
            aria-label={props["aria-label"]}
            aria-expanded={open}
            {...props}
          >
            {/* make it shrink the name of the selected entry */}
            {!selectedEntry ? (
              label
            ) : (
              <span className="font-bold">{selectedEntry.name}</span>
            )}
            {selectedEntry && (
              <span
                className="cursor-default flex items-center justify-center rounded-full hover:bg-popover-foreground/10 active:bg-popover-foreground/15 size-6 [&_svg]:size-4 pointer-events-auto"
                onClick={(e) => {
                  e.preventDefault();
                  field.handleChange("");
                }}
              >
                <X />
              </span>
            )}
            <ChevronsUpDownIcon className="ml-auto" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          style={{ width: `${popoverWidth}px` }}
          className={`p-0`}
        >
          <Command>
            <CommandInput closeButton placeholder={inputPlaceholder} />
            <CommandList onWheelCapture={(e) => e.stopPropagation()}>
              {isLoading ? (
                <CommandLoading label={loadingMessage}>
                  {loadingMessage}
                </CommandLoading>
              ) : (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              )}
              {entries.length !== 0 &&
                !isLoading &&
                entries.map(([heading, items], valuesIdx, entries) => (
                  <Fragment key={valuesIdx}>
                    <CommandGroup heading={heading}>
                      {items.map(({ label, value }) => (
                        <CommandItem
                          className={cn(
                            value === field.state.value &&
                              "bg-primary/10 data-[selected=true]:bg-primary/20 hover:data-[selected=true]:bg-primary/20 active:data-[selected=true]:bg-primary/25",
                          )}
                          key={value}
                          value={value as string}
                          onSelect={() => {
                            field.handleChange(value);
                            setOpen(false);
                          }}
                        >
                          <span
                            className={cn(
                              value === field.state.value && "text-primary",
                            )}
                          >
                            {label}
                          </span>
                          <CheckIcon
                            className={cn(
                              "ml-auto size-4 text-primary",
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

              {!entries.length && !isLoading && (
                <p className="py-2 text-center text-sm text-muted-foreground">
                  {refetchMessage}
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => refetch?.()}
                  >
                    Попробовать еще раз
                  </Button>
                </p>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
};

export default ComboboxField;
