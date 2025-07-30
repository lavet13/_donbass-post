import { decodeJwt, type JWTPayload } from "jose";

export type CustomJWTPayload = {
  id: string;
  manager: boolean;
  phone: string;
  /**
   * JWT Issuer
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.1 RFC7519#section-4.1.1}
   */
  iss?: string;

  /**
   * JWT Subject
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.2 RFC7519#section-4.1.2}
   */
  sub?: string;

  /**
   * JWT Audience
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.3 RFC7519#section-4.1.3}
   */
  aud?: string | string[];

  /**
   * JWT ID
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.7 RFC7519#section-4.1.7}
   */
  jti?: string;

  /**
   * JWT Not Before
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.5 RFC7519#section-4.1.5}
   */
  nbf?: number;

  /**
   * JWT Expiration Time
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.4 RFC7519#section-4.1.4}
   */
  exp?: number;

  /**
   * JWT Issued At
   *
   * @see {@link https://www.rfc-editor.org/rfc/rfc7519#section-4.1.6 RFC7519#section-4.1.6}
   */
  iat?: number;
};

export const decodeJWTPayload = (token: string): CustomJWTPayload | null => {
  try {
    const payload = decodeJwt<CustomJWTPayload>(token);

    // Check for missing expiration claim
    if (!payload.exp) {
      throw new Error("No expiration claim found");
    }

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error("Token has expired");
    }

    return payload;
  } catch (error) {
    if (error instanceof Error) {
      console.warn("Jwt decode failed:", error.message);
    }
    return null;
  }
};

/**
 * Extract multiple claims at once with type safety
 */
export function getJWTClaims<K extends keyof CustomJWTPayload>(
  token: string,
  claims: K[],
): Pick<CustomJWTPayload, K> | null {
  try {
    const payload = decodeJwt<CustomJWTPayload>(token);
    const result = {} as Pick<CustomJWTPayload, K>;

    for (const claim of claims) {
      result[claim] = payload[claim];
    }

    return result;
  } catch {
    return null;
  }
}
