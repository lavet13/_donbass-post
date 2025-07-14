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
    label: string;
  }
> = ({
  className,
  label,
  width = "200px",
  emptyMessage = "Не найдено.",
  inputPlaceholder = "Найти...",
  isLoading = undefined,
  ...props
}) => {
  const field = useFieldContext<ValuesType>();
  const values = field.state.value;
  const [open, setOpen] = useState(false);

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
      <PopoverContent className={`w-[${width}] p-0`}>
        <Command>
          <CommandInput placeholder={inputPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {Object.entries(values ?? {}).map(([heading, items], valuesIdx) => (
              <CommandGroup key={valuesIdx} heading={heading}>
                {items.map(({ label, value }) => (
                  <CommandItem
                    key={value}
                    value={value as string}
                    onSelect={(currentValue) => {
                      console.log({ currentValue });
                      setOpen(false);
                    }}
                  >
                    {label}
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
