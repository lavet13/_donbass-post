import { useFormContext } from "@/hooks/form-context";
import { cn } from "@/lib/utils";
import type { ComponentProps, FC } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const SubscribeButton: FC<
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
              <Loader2 className="animate-spin" />
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

export default SubscribeButton;
