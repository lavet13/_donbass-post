import { useMessageTimer } from "@/hooks/use-message-timer";
import { Tooltip } from "@/components/ui/tooltip";
import { CheckCircle, X } from "lucide-react";
import { useState, type FC } from "react";
import { cn } from "@/lib/utils";

type AutoDimissMessageProps = {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  durationMs?: number;
};

export const AutoDismissMessage: FC<AutoDimissMessageProps> = ({
  message,
  isOpen,
  onClose,
  durationMs = 15000,
}) => {
  const handleCloseDismissMessage = () => {
    onClose();
    setIsHovered(false);
  };
  const remainingTime = useMessageTimer(
    isOpen,
    handleCloseDismissMessage,
    durationMs,
  );
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="relative flex flex-col border border-input rounded-sm p-3 mb-2">
          <div className="flex items-start gap-3">
            <CheckCircle className="size-5 shrink-0" />
            <p className="text-sm">{message}</p>
          </div>
          <Tooltip content="Закрыть">
            <button
              onClick={handleCloseDismissMessage}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={cn(
                "absolute text-sm top-1 right-1 ml-auto pointer-events-auto cursor-default shrink-0 inline-flex justify-center items-center size-6 rounded-full [&_svg]:size-3 [&_svg]:shrink-0 hover:bg-popover-foreground/10 active:bg-popover-foreground/15 outline-none",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                isHovered && "gap-2 px-4 w-12",
              )}
              aria-label="Закрыть сообщение"
              type="button"
            >
              {isHovered && remainingTime}
              <X />
            </button>
          </Tooltip>
        </div>
      )}
    </>
  );
};
