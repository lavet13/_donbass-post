import { useMessageTimer } from "@/hooks/use-message-timer";
import { Tooltip } from "@/components/ui/tooltip";
import { CheckCircle, X } from "lucide-react";
import { Fragment, useState, type FC, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AutoDimissMessageProps = {
  title: string;
  description?: string;
  options?: { label: string; value: string }[];
  extra?: (string | ReactNode)[];
  isOpen: boolean;
  onClose: () => void;
  durationMs?: number;
};

export const AutoDismissMessage: FC<AutoDimissMessageProps> = ({
  title,
  description,
  isOpen,
  options = [],
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

  return (
    <>
      {isOpen && (
        <div className="relative flex flex-col border border-input rounded-sm gap-y-1 p-3 mb-2">
          <div className="flex items-center gap-3">
            <CheckCircle className="size-5 shrink-0" />
            <p className="text-base font-bold">{title}</p>
          </div>
          {description && (
            <span className="text-muted-foreground text-xs">{description}</span>
          )}
          {options.length > 0 && (
            <div className="flex items-center gap-[3px] pb-4 py-2 flex-wrap">
              {options.map(({ label, value }) => {
                return (
                  <Fragment key={`${label}${value}`}>
                    <span className="text-sm font-bold">{label}</span>
                    <span className="text-sm">{value}</span>
                  </Fragment>
                );
              })}
            </div>
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
