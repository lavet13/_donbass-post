import { atom } from "jotai";
import Cookies from "js-cookie";
import type { CookieAttributes } from "node_modules/@types/js-cookie";

const COOKIE_OPTIONS: CookieAttributes = {
  expires: 14,
  secure: !!import.meta.env.PROD,
  sameSite: "strict",
  domain: ".workplace-post.ru",
};

//
export const authTokenAtom = atom(
  () => Cookies.get("auth-token") || null,
  (_get, _set, receivedToken: string | null) => {
    if (receivedToken) {
      Cookies.set("auth-token", receivedToken, COOKIE_OPTIONS);
    } else if (receivedToken === null) {
      Cookies.remove("auth-token", { domain: ".workplace-post.ru" });
    }
  },
);

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
