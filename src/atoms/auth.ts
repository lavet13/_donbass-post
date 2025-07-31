import { atom } from "jotai";
import { AUTH_CONFIG } from "@/config";
import { decodeJWTPayload } from "@/lib/jwt";
import { atomWithCookie } from "@/lib/atom";

const rawTokenAtom = atomWithCookie<string | null>(
  AUTH_CONFIG.cookieName,
  null,
  AUTH_CONFIG.cookieOptions,
  AUTH_CONFIG.removeCookieOptions,
);

// write-only atom
export const setAuthTokenAtom = atom(
  null,
  (_get, set, receivedToken: string | null) => {
    if (receivedToken) {
      const payload = decodeJWTPayload(receivedToken);
      import.meta.env.DEV && console.log({ payload });

      if (!payload) {
        set(rawTokenAtom, null);
        return;
      }

      set(rawTokenAtom, receivedToken);
    } else if (receivedToken === null) {
      set(rawTokenAtom, null);
    }
  },
);

// Read-only atom to get the current token
export const currentAuthTokenAtom = atom(
  async (get) => await get(rawTokenAtom),
);

// read-write atom
export const jwtPayloadAtom = atom(async (get) => {
  const token = await get(currentAuthTokenAtom);
  if (!token) return null;

  return decodeJWTPayload(token);
});

export const isAuthenticatedAtom = atom(
  async (get) => !!(await get(jwtPayloadAtom)),
);

/**
 * Get remaining time until token expires (in seconds)
 */
export const jwtTimeToExpiryAtom = atom(async (get) => {
  const payload = await get(jwtPayloadAtom);
  if (!payload || !payload.exp) {
    return 0;
  }

  const now = Math.floor(Date.now() / 1000);

  return Math.max(0, payload.exp - now);
});
