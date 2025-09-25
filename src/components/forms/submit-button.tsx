import { useFormContext } from "@/hooks/form-context";
import { cn } from "@/lib/utils";
import type { ComponentProps, FC, ReactNode } from "react";
import { Button, Spinner } from "@radix-ui/themes";

const SubmitButton: FC<
  ComponentProps<typeof Button> & {
    label: string;
    loadingMessage?: string;
    icon?: ReactNode;
  }
> = ({
  className,
  label,
  icon,
  variant = "solid",
  loadingMessage = "Подтверждается",
  ...props
}) => {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => [
        state.canSubmit,
        state.isSubmitting,
        state.isDefaultValue,
        state.values.accepted,
      ]}
      children={([canSubmit, isSubmitting, isDefaultValue, isAccepted]) => (
        <Button
          type="submit"
          disabled={!canSubmit || isDefaultValue || !isAccepted}
          className={cn("", className)}
          variant={variant}
          {...props}
        >
          <Spinner loading={isSubmitting}>{icon}</Spinner>
          {isSubmitting ? loadingMessage : label}
        </Button>
      )}
    />
  );
};

export default SubmitButton;
