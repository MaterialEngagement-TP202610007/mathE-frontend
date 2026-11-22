import { ROUTING } from "@/config/constant.config"
import { HttpError } from "@/lib/http"

/** True when login was refused because the email was not verified yet (403). */
export function isEmailNotVerifiedError(error: unknown): boolean {
  return (
    error instanceof HttpError &&
    error.status === 403 &&
    (error.serverMessage ?? "").toLowerCase().startsWith("email not verified")
  )
}

/** Code-entry page for an email; `sent=false` tells the page the first email failed. */
export function verifyEmailPath(email: string, options: { sent?: boolean; role?: string } = {}): string {
  const params = new URLSearchParams({ email })
  if (options.sent === false) params.set("sent", "0")
  if (options.role) params.set("role", options.role)
  return `${ROUTING.VERIFY_EMAIL}?${params.toString()}`
}
