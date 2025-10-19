import { useRef, forwardRef } from "react";
import { useImperativeHandle } from "react";
import { useControllableState } from "@/hooks/use-controllable-state";
import { TextArea, type TextAreaProps, type TextProps } from "@radix-ui/themes";
import { cn } from "@/lib/utils";
import { useAutosizeTextArea } from ".";

export type AutosizeTextAreaRef = {
  textArea: HTMLTextAreaElement;
  focus: () => void;
  maxHeight: number;
  minHeight: number;
};

export type AutosizeTextAreaProps = {
  maxHeight?: number;
  minHeight?: number;
  value?: any;
  onValueChange?: (value: any) => void;
} & TextAreaProps & TextProps;

export const AutosizeTextarea = forwardRef<
  AutosizeTextAreaRef,
  AutosizeTextAreaProps
>(
  (
    {
      maxHeight = Number.MAX_SAFE_INTEGER,
      minHeight = 52,
      className,
      onValueChange,
      value: valueProp,
      ...props
    },
    ref,
  ) => {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const [value, setValue] = useControllableState({
      defaultProp: "",
      prop: valueProp,
      onChange: onValueChange,
    });

    useAutosizeTextArea({
      textAreaRef,
      triggerAutoSize: value,
      maxHeight,
      minHeight,
    });

    useImperativeHandle(ref, () => ({
      textArea: textAreaRef.current as HTMLTextAreaElement,
      focus: () => textAreaRef?.current?.focus(),
      maxHeight,
      minHeight,
    }));

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(event.target.value);
    };

    return (
      <TextArea
        {...props}
        value={value}
        ref={textAreaRef}
        className={cn("", className)}
        onChange={handleChange}
      />
    );
  },
);

AutosizeTextarea.displayName = "AutosizeTextarea";
