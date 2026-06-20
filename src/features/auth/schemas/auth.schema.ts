import { z } from "zod"

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
const PHONE_REGEX = /^\d{7,15}$/
// Only letters (including Spanish accented), spaces, hyphens, apostrophes, periods
const SAFE_NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'\-.]+$/

export const loginSchema = z.object({
  email: z.email("Correo electrónico no válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
})

/**
 * Validates only the free-text register fields. School, grade and terms are
 * custom controlled components, validated separately in the page.
 */
export const registerTextSchema = z
  .object({
    name: z
      .string()
      .min(2, "Ingresa tu nombre completo")
      .max(100, "Nombre demasiado largo")
      .regex(SAFE_NAME_REGEX, "El nombre solo puede contener letras, espacios y guiones"),
    email: z.email("Correo electrónico no válido"),
    birthDate: z
      .string()
      .min(1, "La fecha de nacimiento es obligatoria")
      .refine((d) => !Number.isNaN(Date.parse(d)), "Fecha no válida"),
    phoneNumber: z
      .string()
      .regex(PHONE_REGEX, "Solo se permiten dígitos (7–15 números)")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .regex(
        PASSWORD_REGEX,
        "Mínimo 8 caracteres, con al menos una letra y un número",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterTextValues = z.infer<typeof registerTextSchema>
