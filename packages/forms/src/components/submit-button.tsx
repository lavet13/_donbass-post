import { useFormContext } from "../hooks/form-context";
import { cn } from "@donbass-post/ui/utils";
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
  variant = "classic",
  loadingMessage = "Подтверждается",
  loading = false,
  ...props
}) => {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting]}
      children={([canSubmit, isSubmitting]) => {
        return (
          <Button
            type="submit"
            disabled={!canSubmit || loading}
            className={cn("", className)}
            variant={variant}
            {...props}
          >
            <Spinner loading={isSubmitting || loading}>{icon}</Spinner>
            {isSubmitting || loading ? loadingMessage : label}
          </Button>
        );
      }}
    />
  );
};

export default SubmitButton;
