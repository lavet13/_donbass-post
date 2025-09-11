import { useFormContext } from "@/hooks/form-context";
import { cn } from "@/lib/utils";
import type { ComponentProps, FC } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

const SubmitButton: FC<
  ComponentProps<"button"> & { label: string; loadingMessage?: string }
> = ({ className, label, loadingMessage = "Подтверждается", ...props }) => {
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
          {...props}
        >
          {isSubmitting ? (
            <>
              <Icons.spinner className="text-primary-foreground size-4" />
              {loadingMessage}
            </>
          ) : (
            <>{label}</>
          )}
        </Button>
      )}
    />
  );
};

export default SubmitButton;
