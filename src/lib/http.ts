import axios, { AxiosError } from "axios"
import { ENV } from "@/config/env.config"

/** Client-side request timeout. Netlify's proxy gives up at ~26 s, so 30 s is a safe ceiling. */
const REQUEST_TIMEOUT_MS = 30_000

export type HttpErrorKind = "http" | "network" | "timeout" | "canceled"

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public kind: HttpErrorKind = "http",
    /** Raw message returned by the backend (`{ error }`), if any. */
    public serverMessage?: string,
  ) {
    super(message)
    this.name = "HttpError"
  }
}

export const api = axios.create({
  baseURL: ENV.BASE_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
})

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(fn: () => void): void {
  onUnauthorized = fn
}

// ── Message normalization ─────────────────────────────────────────────────────

const SERVER_UNAVAILABLE_MESSAGE =
  "El servidor está iniciando o no responde. Intenta de nuevo en unos segundos."

/** Known English backend messages → Spanish UI copy. Matched by prefix, case-insensitive. */
const KNOWN_SERVER_MESSAGES: { match: string; message: string }[] = [
  { match: "invalid credentials", message: "Correo o contraseña incorrectos." },
  {
    match: "account is inactive",
    message: "Tu cuenta aún no está activa. Contacta a un administrador para activarla.",
  },
  { match: "invalid session", message: "Tu sesión no es válida. Inicia sesión nuevamente." },
  { match: "email already registered", message: "Este correo ya está registrado." },
  {
    match: "you already have an active questionnaire",
    message: "Ya tienes un cuestionario en progreso.",
  },
  {
    match: "no active questionnaire",
    message: "No tienes un cuestionario en progreso.",
  },
  // Rate limits (429). Specific prefixes first: the generic "too many" catch-all must stay last.
  {
    match: "too many login attempts",
    message: "Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.",
  },
  {
    match: "too many registration attempts",
    message: "Demasiados intentos de registro. Intenta de nuevo en 15 minutos.",
  },
  {
    match: "too many question generation requests",
    message: "Demasiadas solicitudes de generación de preguntas. Intenta de nuevo en 10 minutos.",
  },
  { match: "too many", message: "Demasiadas solicitudes. Espera un momento e intenta de nuevo." },
]

function translateServerMessage(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const normalized = raw.trim().toLowerCase()
  return KNOWN_SERVER_MESSAGES.find((m) => normalized.startsWith(m.match))?.message
}

function messageFor(status: number, kind: HttpErrorKind, serverMessage?: string): string {
  const translated = translateServerMessage(serverMessage)
  if (translated) return translated

  if (kind === "canceled") return "La solicitud fue cancelada."
  if (kind === "timeout") return "El servidor tardó demasiado en responder. Intenta de nuevo en unos segundos."
  if (kind === "network") return "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo."

  switch (status) {
    case 400:
      return serverMessage || "La solicitud no es válida. Revisa los datos e intenta de nuevo."
    case 401:
      return "Tu sesión expiró. Inicia sesión nuevamente."
    case 403:
      return "No tienes permisos para realizar esta acción."
    case 404:
      return "No se encontró el recurso solicitado."
    case 409:
      return serverMessage || "La operación no se pudo completar porque entra en conflicto con el estado actual."
    case 429:
      return "Demasiadas solicitudes. Espera un momento e intenta de nuevo."
    case 502:
    case 503:
    case 504:
      return SERVER_UNAVAILABLE_MESSAGE
    default:
      return status >= 500
        ? "Ocurrió un error en el servidor. Intenta de nuevo más tarde."
        : serverMessage || "No se pudo completar la solicitud."
  }
}

function classify(error: AxiosError): HttpErrorKind {
  if (axios.isCancel(error) || error.code === "ERR_CANCELED") return "canceled"
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") return "timeout"
  if (!error.response) return "network"
  return "http"
}

/** True for failures worth retrying: server waking up, proxy timeout or lost connectivity. */
export function isTransientError(error: unknown): boolean {
  if (!(error instanceof HttpError)) return false
  if (error.kind === "network" || error.kind === "timeout") return true
  return error.status === 502 || error.status === 503 || error.status === 504
}

/** User-facing message for any thrown value. */
export function getErrorMessage(error: unknown, fallback = "Ocurrió un error inesperado. Intenta de nuevo."): string {
  if (error instanceof HttpError) return error.message
  return fallback
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const kind = classify(error)
    const status = error.response?.status ?? 0

    if (status === 401) {
      onUnauthorized?.()
    }

    const data = error.response?.data
    const serverMessage =
      data && typeof data === "object" ? data.error || data.message || undefined : undefined

    return Promise.reject(
      new HttpError(status, messageFor(status, kind, serverMessage), kind, serverMessage),
    )
  },
)
