import { z } from "zod"

/** Reduce a ZodError to `{ field: firstMessage }` for inline form display. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === "string" && !(key in result)) {
      result[key] = issue.message
    }
  }
  return result
}
