import { atom } from "jotai";
import Cookies from "js-cookie";
import { AUTH_CONFIG } from "@/config";
import { decodeJWTPayload } from "@/lib/jwt";

const rawTokenAtom = atom<string | null>(
  Cookies.get(AUTH_CONFIG.cookieName) || null,
);

// write-only atom
export const authTokenAtom = atom(
  null,
  (_get, set, receivedToken: string | null) => {
    if (receivedToken) {
      const payload = decodeJWTPayload(receivedToken);
      import.meta.env.DEV && console.log({ payload });

      if (!payload) {
        set(rawTokenAtom, null);
        Cookies.remove(AUTH_CONFIG.cookieName, AUTH_CONFIG.removeCookieOptions);
        return;
      }

      set(rawTokenAtom, receivedToken);
      Cookies.set(
        AUTH_CONFIG.cookieName,
        receivedToken,
        AUTH_CONFIG.cookieOptions,
      );
    } else if (receivedToken === null) {
      set(rawTokenAtom, null);
      Cookies.remove(AUTH_CONFIG.cookieName, AUTH_CONFIG.removeCookieOptions);
    }
  },
);

// read-write atom
export const jwtPayloadAtom = atom((get) => {
  const token = get(rawTokenAtom);
  if (!token) return null;

  return decodeJWTPayload(token);
});

export const isAuthenticatedAtom = atom((get) => !!get(jwtPayloadAtom));

/**
 * Get remaining time until token expires (in seconds)
 */
export const jwtTimeToExpiryAtom = atom((get) => {
  const payload = get(jwtPayloadAtom);
  if (!payload || !payload.exp) {
    return 0;
  }

  const now = Math.floor(Date.now() / 1000);

  return Math.max(0, payload.exp - now);
});
