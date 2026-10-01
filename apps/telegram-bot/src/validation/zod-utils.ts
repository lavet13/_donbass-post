import { z } from "zod";
/**
 * Wraps a schema so blank/whitespace-only env strings become `undefined`
 * BEFORE the inner schema runs. Without this, z.coerce.number("") === 0,
 * which makes a missing var look like a real value of 0.
 *
 * @param schema - the schema to apply once the value is normalized
 */
export function blankToUndefined<T extends z.ZodType>(schema: T) {
  return z.preprocess((val) => {
    // Only strings can be "blank"; pass everything else through untouched.
    if (typeof val === "string" && val.trim() === "") return undefined;
    return val;
  }, schema);
}
