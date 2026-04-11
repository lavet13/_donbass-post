import { z } from "zod";
import { error } from "@/router";

export function parseBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; response: Response } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const messages = result.error.issues.map(i => i.message).join("; ");
    console.log({ messages });

    return {
      success: false,
      response: error(`${messages}`),
    };
  }

  return { success: true, data: result.data };
}
