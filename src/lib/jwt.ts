import { decodeJwt, type JWTPayload } from "jose";

export type CustomJWTPayload = {
  id: string;
  manager: boolean;
  phone: string;
} & JWTPayload;

export const decodeJWTPayload = (token: string): CustomJWTPayload | null => {
  try {
    const payload = decodeJwt<CustomJWTPayload>(token);

    // Additional check
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
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
 * Get remaining time until token expires (in seconds)
 */
export const getJWTTimeToExpiry = (token: string): number => {
  try {
    const payload = decodeJwt<CustomJWTPayload>(token);

    if (!payload.exp) return 0;

    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - now);
  } catch {
    return 0;
  }
};
/**
 * Extract specific claims from JWT
 * */
export const getJWTClaim = <K extends keyof CustomJWTPayload>(
  token: string,
  claim: K,
): CustomJWTPayload[K] | null => {
  try {
    const payload = decodeJwt<CustomJWTPayload>(token);

    return payload[claim] ?? null;
  } catch {
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
