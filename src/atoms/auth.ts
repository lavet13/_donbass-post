import { atom } from "jotai";
import { AUTH_CONFIG } from "@/config";
import { decodeJWTPayload } from "@/lib/jwt";
import { atomWithCookie } from "@/lib/atom";

/**
 * Base atom that stores the raw JWT token string in a cookie.
 * This is the single source of truth for the authentication token.
 * Uses atomWithCookie to automatically persist/retrieve from browser cookies.
 */
const rawTokenAtom = atomWithCookie<string | null>(
  AUTH_CONFIG.cookieName,
  null,
  AUTH_CONFIG.cookieOptions,
  AUTH_CONFIG.removeCookieOptions,
);

/**
 * Write-only atom for setting the authentication token.
 * Validates the JWT payload before storing and clears invalid tokens.
 *
 * @param receivedToken - JWT string to store, or null to clear
 *
 * Behavior:
 * - If token is provided: decodes and validates JWT payload first
 * - If payload is invalid: clears the stored token
 * - If token is valid: stores it in rawTokenAtom
 * - If null is passed: explicitly clears the stored token
 */
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

/**
 * Derived atom that returns the decoded JWT payload.
 * Automatically decodes the current token and returns null if no token exists.
 *
 * @returns JWT payload object or null if no valid token
 */
export const jwtPayloadAtom = atom(async (get) => {
  const token = await get(rawTokenAtom);
  if (!token) return null;

  return decodeJWTPayload(token);
});

/**
 * Derived atom that returns the authentication status.
 * User is considered authenticated if a valid JWT payload exists.
 *
 * @returns boolean - true if user has valid JWT, false otherwise
 */
export const isAuthenticatedAtom = atom(
  async (get) => !!(await get(jwtPayloadAtom)),
);

/**
 * Derived atom that calculates seconds until JWT expires.
 * Useful for implementing token refresh logic or showing expiry warnings.
 *
 * @returns number - seconds until expiration, or 0 if no token/expired/no exp claim
 *
 * Notes:
 * - Returns 0 if no payload or no 'exp' claim
 * - Uses Math.max to ensure never returns negative values
 * - Compares against current Unix timestamp
 */
export const jwtTimeToExpiryAtom = atom(async (get) => {
  const payload = await get(jwtPayloadAtom);
  if (!payload || !payload.exp) {
    return 0;
  }

  const now = Math.floor(Date.now() / 1000);

  return Math.max(0, payload.exp - now);
});
