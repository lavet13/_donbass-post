import { useEffect, useState } from "react";

export const useMessageTimer = ({
  isOpen,
  onClose,
  durationMs,
}: {
  isOpen: boolean;
  onClose: () => void;
  durationMs: number;
}) => {
  const [count, setCount] = useState(durationMs / 1000);

  useEffect(() => {
    if (!isOpen) return;

    setCount(durationMs / 1000);
    let intervalId: NodeJS.Timeout | null = null;
    let nextCount = durationMs / 1000;

    const onTick = () => {
      setCount((c) => {
        nextCount = c - 1;
        return nextCount;
      });

      if (nextCount === 0) {
        onClose();
      }
    };

    intervalId = setInterval(onTick, 1000);

    return () => {
      if (intervalId) clearTimeout(intervalId);
    };
  }, [isOpen, durationMs]);

  return count;
};
