import type { CookieAttributes } from "node_modules/@types/js-cookie";

/**
 * Authentication configuration object containing all auth-related settings
 * for cookie management, headers, and environment-specific options.
 *
 * This configuration handles differences between development and production
 * environments, particularly for cookie domain settings and security options.
 *
 * @example
 * ```typescript
 * // Setting a cookie
 * Cookies.set(AUTH_CONFIG.cookieName, token, AUTH_CONFIG.cookieOptions);
 *
 * // Adding to request headers
 * headers[AUTH_CONFIG.headerName] = `Bearer ${token}`;
 * or
 * headers.set(AUTH_CONFIG.headerName, `Bearer ${token}`);
 *
 * // Removing a cookie
 * Cookies.remove(AUTH_CONFIG.cookieName, AUTH_CONFIG.removeCookieOptions);
 * ```
 */
export const AUTH_CONFIG = {
  /**
   * The name of the cookie used to store the authentication token.
   *
   * @default "auth-token"
   */
  cookieName: "auth-token" as const,

  /**
   * The HTTP header name used for sending the authentication token.
   *
   * @default "Authorization"
   */
  headerName: "Authorization" as const,

  /**
   * Cookie options used when setting the authentication token cookie.
   *
   * - In development: Uses relaxed security settings (secure: false, sameSite: "lax")
   * - In production: Uses strict security settings (secure: true, sameSite: "strict")
   * - Domain is only set in production using VITE_DOMAIN environment variable
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie} Cookie documentation
   */
  cookieOptions: {
    /** Cookie expiration time in days */
    expires: 14,
    /** Only send cookie over HTTPS in production */
    secure: !!import.meta.env.PROD,
    /** CSRF protection - strict in prod, lax in dev for easier development */
    sameSite: import.meta.env.PROD ? "strict" : "lax",
    /** Set domain only in production to allow subdomain access */
    ...(import.meta.env.PROD && { domain: import.meta.env.VITE_DOMAIN }),
  } satisfies CookieAttributes,

  /**
   * Cookie options used when removing the authentication token cookie.
   *
   * Must match the domain setting used when the cookie was created,
   * otherwise the removal will fail.
   *
   * @see {@link https://github.com/js-cookie/js-cookie#remove} js-cookie remove documentation
   */
  removeCookieOptions: {
    /** Must match domain used when setting the cookie */
    ...(import.meta.env.PROD && { domain: import.meta.env.VITE_DOMAIN }),
  } satisfies CookieAttributes,
};
