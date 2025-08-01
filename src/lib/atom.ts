import type { CookieAttributes } from "node_modules/@types/js-cookie";
import Cookies from "js-cookie";
import { atomWithStorage } from "jotai/utils";

// Check if the browser supports the Cookie Store API
const hasCookieStore = typeof window !== "undefined" && "cookieStore" in window;

export function atomWithCookie<T extends string | null>(
  key: string,
  initialValue: T,
  cookieOptions?: CookieAttributes,
  removeCookieOptions?: CookieAttributes,
) {
  // Get initial value from cookie
  const getCookieValue = (): T => {
    const value = Cookies.get(key);
    return (value as T) || initialValue;
  };

  const defaultValue = getCookieValue();

  return atomWithStorage<T>("cookie:" + key, defaultValue, {
    getItem: () => {
      return getCookieValue();
    },

    setItem: (_, value) => {
      if (value === null || value === initialValue) {
        Cookies.remove(key, removeCookieOptions);
      } else {
        Cookies.set(key, value, cookieOptions);
      }
    },

    removeItem: () => {
      Cookies.remove(key, removeCookieOptions);
    },

    subscribe: (_, callback) => {
      if (hasCookieStore) {
        // Use native cookie change events when available
        function handler(event: any) {
          const cookie = event.changed?.find((c: any) => c.name === key);
          if (cookie) {
            callback((cookie.value as T) || initialValue);
          }
          // Also handle deleted cookies
          const deleted = event.deleted?.find((c: any) => c.name === key);
          if (deleted) {
            callback(initialValue);
          }
        }

        (window as any).cookieStore.addEventListener("change", handler);
        return () => {
          (window as any).cookieStore.removeEventListener("change", handler);
        };
      }
    },
  });
}
