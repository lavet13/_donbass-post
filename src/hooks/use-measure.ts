import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

type UseElementWidthProps = {
  dependencies?: readonly unknown[];
};

type ElementBounds = {
  width: number;
  height: number;
  x: number;
  y: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export const useMeasure = <T extends HTMLElement = HTMLElement>(
  props: UseElementWidthProps = {},
): [RefObject<T | null>, ElementBounds | null] => {
  const { dependencies = [] } = props;
  const elementRef = useRef<T | null>(null);
  const [bounds, setBounds] = useState<ElementBounds | null>(null);

  const updateBounds = useCallback((rect: DOMRect) => {
    const newBounds: ElementBounds = {
      width: rect.width,
      height: rect.height,
      x: rect.x,
      y: rect.y,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
    };
    setBounds(newBounds);
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const rect = entry.target.getBoundingClientRect();

        updateBounds(rect);
      }
    });

    if (elementRef.current) {
      observer.observe(elementRef.current);
      updateBounds(elementRef.current.getBoundingClientRect());
    }

    return () => observer.disconnect();
  }, [...dependencies]);

  return [elementRef, bounds] as const;
};
