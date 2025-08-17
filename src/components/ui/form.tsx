import * as LabelPrimitive from "@radix-ui/react-label";
import { Label } from "@/components/ui/label";
import type { FC } from "react";
import { type ComponentProps } from "react";
import { useFieldContext } from "@/hooks/form-context";
import { cn } from "@/lib/utils";

export const FormLabel: FC<ComponentProps<typeof LabelPrimitive.Root>> = ({
  className,
  htmlFor,
  ...props
}) => {
  const field = useFieldContext();
  const name = field.name;
  const hasErrors = !!field.state.meta.errors.length;

  return (
    <Label
      data-slot="form-label"
      data-error={hasErrors}
      htmlFor={htmlFor || name}
      className={cn("data-[error=true]:text-destructive", className)}
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
      className={cn("flex flex-col gap-y-1 sm:gap-y-1.5", className)}
      {...props}
    />
  );
};

export const FormMessage: FC<ComponentProps<"p">> = ({
  className,
  ...props
}) => {
  const field = useFieldContext();
  const hasErrors = !!field.state.meta.errors.length;
  const errors = field.state.meta.errors;

  if (!hasErrors) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      className={cn("text-destructive text-sm sm:text-xs", className)}
      {...props}
    >
      {errors.join(", ")}
    </p>
  );
};

export const FormDescription: FC<ComponentProps<"p">> = ({
  className,
  ...props
}) => {
  return (
    <p
      data-slot="form-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
};
