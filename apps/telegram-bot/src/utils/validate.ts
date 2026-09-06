import { z } from "zod";
import { validationError } from "@/router";

export function parseBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; response: Response } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      if (issue.path.length === 0) continue;
      const key = issue.path.join(".");
      if (!(key in fieldErrors)) {
        fieldErrors[key] = issue.message;
      }
    }

    const prettifiedErrors = z.prettifyError(result.error);
    console.error({ prettifiedErrors });

    return {
      success: false,
      response: validationError(fieldErrors),
    };
  }

  return { success: true, data: result.data };
}
