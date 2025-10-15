import { useMessageTimer } from "@/hooks/use-message-timer";
import { Tooltip } from "@radix-ui/themes";
import {
  CheckCircle,
  CircleX,
  Info,
  TriangleAlert,
  X,
  type LucideProps,
} from "lucide-react";
import {
  Fragment,
  useState,
  type FC,
  type ForwardRefExoticComponent,
  type ReactNode,
  type RefAttributes,
} from "react";
import { cn } from "@/lib/utils";

export type AutoDimissMessageProps = {
  title?: string;
  variant?: "success" | "warning" | "info" | "error";
  description?: string;
  extra?: (string | ReactNode)[];
  isOpen: boolean;
  onClose: () => void;
  durationMs?: number;
};

export const AutoDismissMessage: FC<AutoDimissMessageProps> = ({
  title,
  description,
  variant = "success",
  isOpen,
  extra = [],
  onClose: propsOnClose,
  durationMs = 15000,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleCloseDismissMessage = () => {
    propsOnClose();
    setIsHovered(false);
  };

  const remainingTime = useMessageTimer({
    open: isOpen,
    onEnd: handleCloseDismissMessage,
    durationMs,
  });

  const dismissMessageType: Record<
    typeof variant,
    {
      icon: ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
      >;
    }
  > = {
    success: {
      icon: CheckCircle,
    },
    info: {
      icon: Info,
    },
    warning: {
      icon: TriangleAlert,
    },
    error: {
      icon: CircleX,
    },
  };

  const dismissMessage = dismissMessageType[variant];

  return (
    <>
      {isOpen && (
        <div
          className={cn(
            "border-input relative mb-2 flex flex-col gap-y-1 rounded-lg border p-3",
            variant === "success" &&
              "text-success-foreground bg-success border-success-border",
            variant === "info" &&
              "text-info-foreground bg-info border-info-border",
            variant === "warning" &&
              "text-warning-foreground bg-warning border-warning-border",
            variant === "error" &&
              "text-destructive-foreground bg-destructive border-destructive-border",
          )}
        >
          {title && (
            <div className="flex items-center gap-3 pt-4 sm:pt-0">
              <dismissMessage.icon className="size-5 shrink-0" />
              <p className="font-bold">{title}</p>
            </div>
          )}
          {description && (
            <span className="text-muted-foreground text-xs">{description}</span>
          )}
          {extra.length > 0 && (
            <div>
              {extra.map((item, index) => {
                if (typeof item === "string") {
                  return (
                    <p key={index} className="text-sm">
                      {item}
                    </p>
                  );
                }
                return <Fragment key={index}>{item}</Fragment>;
              })}
            </div>
          )}
          <Tooltip content="Закрыть">
            <button
              onClick={handleCloseDismissMessage}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={cn(
                "hover:bg-popover-foreground/10 active:bg-popover-foreground/15 pointer-events-auto absolute top-1 right-1 ml-auto inline-flex size-6 shrink-0 cursor-default items-center justify-center rounded-full text-sm outline-none [&_svg]:size-3 [&_svg]:shrink-0",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                variant === "success" &&
                  "focus-visible:border-success-ring focus-visible:ring-success-ring/50",
                variant === "info" &&
                  "focus-visible:border-info-ring focus-visible:ring-info-ring/50",
                variant === "warning" &&
                  "focus-visible:border-warning-ring focus-visible:ring-warning-ring/50",
                variant === "error" &&
                  "focus-visible:border-destructive-ring focus-visible:ring-destructive-ring/50",
                isHovered && "w-11 justify-between gap-0 px-1.5",
                remainingTime < 5 &&
                  "w-11 animate-pulse justify-between gap-0 px-1.5",
              )}
              aria-label="Закрыть сообщение"
              type="button"
            >
              {isHovered ? remainingTime : remainingTime < 5 && remainingTime}
              <X />
            </button>
          </Tooltip>
        </div>
      )}
    </>
  );
};
