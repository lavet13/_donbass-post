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
  (get, set, receivedToken: string | null) => {
    if (receivedToken) {
      set(userPayloadAtom, receivedToken);
      const payload = get(userPayloadAtom);

      if (!payload) {
        console.warn("Invalid token received, not storing");
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
export const userPayloadAtom = atom(
  (get) => {
    const token = get(rawTokenAtom);
    if (!token) return null;

    const payload = decodeJWTPayload(token);
    if (!payload) return null;

    return payload;
  },
  (_get, set, updateToken: string | null) => {
    set(rawTokenAtom, updateToken);
  },
);

// read-only atom (derived atom)
export const isJWTExpiredAtom = atom((get) => {
  const payload = get(userPayloadAtom);

  if (!payload?.exp) {
    console.warn("no expiration claim found");
    return true;
  }

  return payload.exp < Math.floor(Date.now() / 1000);
});

// read-only atom (derived atom)
export const isAuthenticatingAtom = atom((get) => {
  const token = get(rawTokenAtom);
  return !!token && !get(isJWTExpiredAtom);
});
