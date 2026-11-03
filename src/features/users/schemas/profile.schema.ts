import { z } from "zod"
import { PHONE_ERROR_MESSAGE, PHONE_REGEX } from "@/features/auth/schemas/auth.schema"

/**
 * Validates the free-text profile fields. Email and password are not editable on the
 * profile; school and birth-date presence depend on the stored user and are checked in the page.
 */
export const profileTextSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "Nombre demasiado largo"),
  birthDate: z
    .string()
    .refine((d) => d === "" || !Number.isNaN(Date.parse(d)), "Fecha no válida"),
  phoneNumber: z
    .string()
    .trim()
    // Empty clears the stored phone; otherwise it must match the register/backend format.
    .refine((v) => v === "" || PHONE_REGEX.test(v), PHONE_ERROR_MESSAGE),
})

export type ProfileTextValues = z.infer<typeof profileTextSchema>
