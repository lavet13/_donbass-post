import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// radix-ui primitive(link: https://github.com/radix-ui/primitives/blob/main/packages/core/primitive/src/primitive.tsx#L11)
export function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {},
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);

    if (checkForDefaultPrevented === false || !event.defaultPrevented) {
      return ourEventHandler?.(event);
    }
  };
}

/**
 * Reads a CSS custom property from :root (e.g. "--breakpoint-md"), so the
 * stylesheet stays the single source for breakpoint values.
 *
 * Returns "" outside the browser: components call this during render, and the
 * prerender step renders them in Node, where there is no document. That is
 * harmless there, because useMediaQuery starts as false and only reads the
 * query inside an effect, which never runs on the server.
 */
export function cssVar(name: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
