import { atom } from "jotai";
import Cookies from "js-cookie";
import { AUTH_CONFIG } from "@/config";

// read-write atom
export const authTokenAtom = atom(
  () => Cookies.get(AUTH_CONFIG.cookieName) || null,
  (_get, _set, receivedToken: string | null) => {
    if (receivedToken) {
      Cookies.set(
        AUTH_CONFIG.cookieName,
        receivedToken,
        AUTH_CONFIG.cookieOptions,
      );
    } else if (receivedToken === null) {
      Cookies.remove(AUTH_CONFIG.cookieName, AUTH_CONFIG.removeCookieOptions);
    }
  },
);

// read-only atom (derived atom)
// derives value from other atoms
// cannot be written to directly
export const userIdAtom = atom((get) => {
  const token = get(authTokenAtom);
  if (!token) {
    return null;
  }
  // here we must process the token and take userId
});

// read-only atom (derived atom)
// derives value from other atoms
// cannot be written to directly
export const isAuthenticatingAtom = atom((get) => {
  const token = get(authTokenAtom);
  return !!token;
});
