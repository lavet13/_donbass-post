import * as LabelPrimitive from "@radix-ui/react-label";
import { Label } from "@/components/ui/label";
import type { FC } from "react";
import { type ComponentProps } from "react";
import { useFieldContext } from "@/hooks/form-context";
import { cn } from "@/lib/utils";
import { Text, type TextProps } from "@radix-ui/themes";

export const FormLabel: FC<
  ComponentProps<typeof LabelPrimitive.Root> & TextProps
> = ({ className, htmlFor, ...props }) => {
  const field = useFieldContext();
  const name = field.name;
  const hasErrors = !!field.state.meta.errors.length;

  return (
    <Label
      data-slot="form-label"
      data-error={hasErrors}
      htmlFor={htmlFor || name}
      className={cn("data-[error=true]:text-red-11 mb-2", className)}
      {...props}
    />
  );
};

export const FormItem: FC<ComponentProps<"div">> = ({
  className,
  ...props
}) => {
  return (
    <div
      data-slot="form-item"
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
};

export const FormMessage: FC<TextProps> = ({ className, ...props }) => {
  const field = useFieldContext();
  const hasErrors = !!field.state.meta.errors.length;
  const errors = field.state.meta.errors;

  if (!hasErrors) {
    return null;
  }

  return (
    <Text
      as="p"
      wrap="balance"
      data-slot="form-message"
      className={cn(
        "text-red-11 mt-0.5 text-center text-sm leading-[15px] sm:text-start sm:text-xs",
        className,
      )}
      {...props}
    >
      {errors.join(", ")}
    </Text>
  );
};

export const FormDescription: FC<TextProps> = ({ className, ...props }) => {
  return (
    <Text
      as="p"
      wrap="balance"
      data-slot="form-description"
      className={cn("text-grayA-11 text-sm", className)}
      {...props}
    />
  );
};
