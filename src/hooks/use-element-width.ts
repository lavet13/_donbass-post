import { useEffect, useRef, useState } from "react";

type UseElementWidthProps = {
  dependencies: unknown[];
};

export const useElementWidth = <T extends HTMLElement = HTMLElement>({
  dependencies,
}: UseElementWidthProps) => {
  const elementRef = useRef<T | null>(null);
  const [width, setPopoverWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      const width = elementRef.current?.offsetWidth ?? 0;
      setPopoverWidth(width);
    };

    if (elementRef.current) {
      updateWidth();
      window.addEventListener("resize", updateWidth);
    }

    return () => window.removeEventListener("resize", updateWidth);
  }, dependencies);

  return {
    width,
    elementRef,
  };
};
