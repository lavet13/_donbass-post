import { useEffect, useState } from "react";

export const useMessageTimer = (
  isOpen: boolean,
  onClose: () => void,
  duration: number = 5000,
) => {
  const [count, setCount] = useState(duration / 1000);

  useEffect(() => {
    if (!isOpen) return;

    setCount(duration / 1000);
    let intervalId: NodeJS.Timeout | null = null;
    let nextCount = duration / 1000;

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
  }, [isOpen, duration]);

  return count;
};
