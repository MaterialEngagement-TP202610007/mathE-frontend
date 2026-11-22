import { z } from "zod"

// Mirrors the backend `regularExps` (backend/src/config/helpers/regular-exp.ts) — keep in sync.
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/
export const PHONE_ERROR_MESSAGE =
  "Teléfono no válido: solo dígitos sin espacios (máx. 15); puede iniciar con +, pero no con 0"
// Only letters (including Spanish accented), spaces, hyphens, apostrophes, periods
const SAFE_NAME_REGEX = /^[\p{L}\s'.-]+$/u
// A name word has at least two letters ("Ana", "de"); initials do not count.
const NAME_WORD_REGEX = /^\p{L}[\p{L}'.-]*\p{L}$/u

/** Mirrors the backend RegisterUserDto: a first name and a last name. */
export function hasFirstAndLastName(name: string): boolean {
  const words = name.trim().split(/\s+/).filter((w) => NAME_WORD_REGEX.test(w))
  return words.length >= 2
}

/** Accepted ages per account type (inclusive) — mirrors the backend RegisterUserDto. */
export const AGE_RANGE = {
  student: { min: 5, max: 20, label: "un estudiante" },
  teacher: { min: 18, max: 100, label: "un profesor" },
} as const

export type AgeRangeRole = keyof typeof AGE_RANGE

/** Whole years between a `yyyy-MM-dd` birth date and `today`. */
export function ageOn(birthDate: string, today: Date = new Date()): number {
  const [y, m, d] = birthDate.split("-").map(Number)
  let age = today.getFullYear() - y
  const month = today.getMonth() + 1
  if (month < m || (month === m && today.getDate() < d)) age -= 1
  return age
}

/** Spanish error for a birth date outside the role's age range, or undefined when valid. */
export function birthDateRangeError(
  birthDate: string,
  role: AgeRangeRole,
  today: Date = new Date(),
): string | undefined {
  const { min, max, label } = AGE_RANGE[role]
  const age = ageOn(birthDate, today)
  if (age < 0) return "La fecha de nacimiento no puede ser futura"
  if (age < min || age > max) {
    return `La edad de ${label} debe estar entre ${min} y ${max} años`
  }
  return undefined
}

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
      .regex(SAFE_NAME_REGEX, "El nombre solo puede contener letras, espacios y guiones")
      .refine(hasFirstAndLastName, "Ingresa tu nombre y apellido"),
    email: z.email("Correo electrónico no válido"),
    birthDate: z
      .string()
      .min(1, "La fecha de nacimiento es obligatoria")
      .refine((d) => !Number.isNaN(Date.parse(d)), "Fecha no válida"),
    phoneNumber: z
      .string()
      .regex(PHONE_REGEX, PHONE_ERROR_MESSAGE)
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .regex(
        PASSWORD_REGEX,
        "Mínimo 8 caracteres, solo letras y números (sin símbolos, tildes, ñ ni espacios), con al menos una letra y un número",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterTextValues = z.infer<typeof registerTextSchema>
