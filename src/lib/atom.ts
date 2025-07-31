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

  // Set initial cookie if it doesn't exist
  const defaultValue = getCookieValue();
  if (!defaultValue && initialValue) {
    Cookies.set(key, initialValue, cookieOptions);
  }

  return atomWithStorage<T>("cookie:" + key, defaultValue, {
    getItem: async () => {
      if (hasCookieStore) {
        // Use Cookie Store API if available
        const cookie = await (window as any).cookieStore.get(key);
        return (cookie?.value as T) || initialValue;
      } else {
        // Fallback to js-cookie
        return getCookieValue();
      }
    },

    setItem: async (_, value) => {
      if (value === null || value === initialValue) {
        Cookies.remove(key, removeCookieOptions);
        if (hasCookieStore) {
          await (window as any).cookieStore.delete(key);
        }
      } else {
        Cookies.set(key, value, cookieOptions);
        if (hasCookieStore) {
          await (window as any).cookieStore.set(key, value);
        }
      }
    },

    removeItem: async () => {
      Cookies.remove(key, removeCookieOptions);
      if (hasCookieStore) {
        await (window as any).cookieStore.delete(key);
      }
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
      } else {
        // Fallback: Use focus events and periodic checks
        let currentValue = getCookieValue();

        const checkForChanges = () => {
          const newValue = getCookieValue();
          if (newValue !== currentValue) {
            currentValue = newValue;
            callback(newValue);
          }
        };

        // Check on page focus (cross-tab changes)
        const handleFocus = () => checkForChanges();
        window.addEventListener("focus", handleFocus);

        // Optional: Light polling as backup (every 5 seconds)
        const intervalId = setInterval(checkForChanges, 5000);

        return () => {
          window.removeEventListener("focus", handleFocus);
          clearInterval(intervalId);
        };
      }
    },
  });
}
