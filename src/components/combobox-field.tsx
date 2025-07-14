import { useState, type ComponentProps, type FC } from "react";
import {
  Popover,
  PopoverArrow,
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
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/hooks/form-context";
import { CheckIcon } from "lucide-react";

type ValueType = { label: string; value: string | number }[];

type ValuesType =
  | {
      [x: string]: ValueType;
    }
  | undefined;

const ComboboxField: FC<
  ComponentProps<"button"> & {
    emptyMessage?: string;
    inputPlaceholder?: string;
    width?: string;
    isLoading?: boolean;
    values?: ValuesType;
    label: string;
  }
> = ({
  className,
  label,
  width = "200px",
  emptyMessage = "Не найдено.",
  inputPlaceholder = "Найти...",
  values = {},
  isLoading = undefined,
  ...props
}) => {
  const field = useFieldContext<string | number>();
  const [open, setOpen] = useState(false);
  console.log({ values });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn(`w-[${width}] justify-between`, className)}
          role="combobox"
          aria-label={props["aria-label"]}
          {...props}
        >
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`min-w-[${width}] max-w-[400px] p-0`}>
        <Command>
          <CommandInput placeholder={inputPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {Object.entries(values ?? {}).map(([heading, items], valuesIdx) => (
              <CommandGroup key={valuesIdx} heading={heading}>
                {items.map(({ label, value }) => (
                  <CommandItem
                    className={cn(
                      value === field.state.value && "bg-primary/10",
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
                        "size-4 text-primary",
                        value === field.state.value
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
        <PopoverArrow />
      </PopoverContent>
    </Popover>
  );
};

export default ComboboxField;
