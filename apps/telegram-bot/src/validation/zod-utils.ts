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

/**
 * Build a Zod field whose value has two possible object shapes that differ only by
 * *which keys are present* (e.g. individual vs. company), when the payload carries
 * no explicit discriminator of its own.
 *
 * Why not a plain `z.union([A, B])`: on failure Zod emits a single `invalid_union`
 * issue at the field's own path with a generic message, so `parseBody` can only tell
 * the client `"sender"` is wrong — never which field. This injects a synthetic `kind`
 * discriminator (from whether `marker` is present) and feeds a real
 * `z.discriminatedUnion`, which commits to one branch and reports *that* branch's own
 * field issues, e.g. `sender.innSender`.
 *
 * The injected tag and each branch's `z.literal` are written from the same value, so
 * they cannot drift. `kind` is internal plumbing: it rides along on the parsed output
 * and consumers ignore it. The discriminator *key* is fixed as `"kind"` on purpose —
 * making it dynamic collapses the computed key to an index signature and breaks
 * `discriminatedUnion`'s type-level narrowing.
 *
 * @typeParam C - present-branch object schema (used when `marker` exists)
 * @typeParam I - absent-branch object schema (used when it doesn't)
 *
 * @param opts - configuration
 * @param opts.marker        - key unique to the present branch, e.g. `"companySender"`
 * @param opts.presentSchema - schema validated when `marker` is present
 * @param opts.absentSchema  - schema validated when `marker` is absent
 *
 * @returns a `z.preprocess`-wrapped `z.discriminatedUnion`, usable as an object field.
 *
 * @example
 * const Schema = z.object({
 *   sender: discriminatedByPresence({
 *     marker: "companySender",
 *     presentSchema: SenderCompanyObj,
 *     absentSchema: SenderIndividualObj,
 *   }),
 * });
 * // company sender, bad ИНН → fieldErrors: { "sender.innSender": "…" }  (not "sender")
 */
export function discriminatedByPresence<
  C extends z.ZodObject,
  I extends z.ZodObject,
>(opts: {
  marker: string; // key unique to the "present" branch, e.g. "companySender"
  presentSchema: C; // branch used when `marker` exists
  absentSchema: I; // branch used when it doesn't
}) {
  const { marker, presentSchema, absentSchema } = opts;
  return z.preprocess(
    (v) =>
      v && typeof v === "object" && !Array.isArray(v)
        ? { ...v, kind: marker in v ? "x" : "y" }
        : v,
    z.discriminatedUnion("kind", [
      presentSchema.extend({ kind: z.literal("x") }),
      absentSchema.extend({ kind: z.literal("y") }),
    ]),
  );
}
