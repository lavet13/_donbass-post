/**
 * Exhaustiveness guard for discriminated unions.
 * If TS can reach this with a real value, a union case is unhandled → COMPILE
 * error. At runtime it throws as a last-resort net (e.g. bad data at a boundary).
 */
export function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}
