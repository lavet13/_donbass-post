/**
 * Strictly parse a string to an integer. Rejects null/empty/floats/trailing junk
 * ("12.9" and "12abc" → null, not 12). Accepts null for ergonomic use with Headers.get().
 *
 * Note: raw == null check for both, null and undefined
 *
 * @param raw - value to parse
 */
export function parseInteger(raw: string | null | undefined): number | null {
  // eslint-disable-next-line
  if (raw == null || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isInteger(n) ? n : null;
}
