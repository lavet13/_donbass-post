import { useMessageTimer } from "@/hooks/use-message-timer";
import { Tooltip } from "@/components/ui/tooltip";
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
    isOpen,
    onClose: handleCloseDismissMessage,
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
            "relative flex flex-col border border-input rounded-lg gap-y-1 p-3 mb-2",
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
              <p className="text-base font-bold">{title}</p>
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
                "absolute text-sm top-1 right-1 ml-auto pointer-events-auto cursor-default shrink-0 inline-flex justify-center items-center size-6 rounded-full [&_svg]:size-3 [&_svg]:shrink-0 hover:bg-popover-foreground/10 active:bg-popover-foreground/15 outline-none",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                variant === "success" &&
                  "focus-visible:border-success-ring focus-visible:ring-success-ring/50",
                variant === "info" &&
                  "focus-visible:border-info-ring focus-visible:ring-info-ring/50",
                variant === "warning" &&
                  "focus-visible:border-warning-ring focus-visible:ring-warning-ring/50",
                variant === "error" &&
                  "focus-visible:border-destructive-ring focus-visible:ring-destructive-ring/50",
                isHovered && "px-1.5 gap-0 justify-between w-11",
                remainingTime < 5 &&
                  "px-1.5 gap-0 justify-between w-11 animate-pulse",
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
