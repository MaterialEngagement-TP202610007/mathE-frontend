import { useEffect, useState, type FormEvent } from "react"
import { MailCheck } from "lucide-react"
import { Link, Navigate, useNavigate, useSearchParams } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ROUTING } from "@/config/constant.config"
import { getErrorMessage } from "@/lib/http"
import { AuthLayout } from "../components/AuthLayout"
import { FormField } from "../components/FormField"
import { authService } from "../services/auth.service"

const CODE_FORMAT = /^\d{6}$/
/** Matches the backend resend cooldown (one code per minute). */
const RESEND_COOLDOWN_SECONDS = 60

/** TP2 CP019: the user proves they own the email by entering the 6-digit code. */
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = searchParams.get("email")?.trim() ?? ""
  const firstEmailFailed = searchParams.get("sent") === "0"
  const role = searchParams.get("role") === "teacher" ? "teacher" : "student"

  const [code, setCode] = useState("")
  const [codeError, setCodeError] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  // The first code was just sent at registration, so resending waits a minute.
  const [cooldown, setCooldown] = useState(firstEmailFailed ? 0 : RESEND_COOLDOWN_SECONDS)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  if (!email) return <Navigate to={ROUTING.LOGIN} replace />

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = code.trim()
    if (!CODE_FORMAT.test(value)) {
      setCodeError("El código debe tener 6 dígitos")
      return
    }
    setCodeError(undefined)
    setError(null)
    setIsVerifying(true)
    try {
      await authService.verifyEmail(email, value)
      toast.success(
        role === "teacher"
          ? "Correo verificado. Tu cuenta de profesor queda pendiente de aprobación."
          : "Correo verificado. Ya puedes iniciar sesión.",
      )
      navigate(`${ROUTING.LOGIN}?role=${role}`, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo verificar el código. Intenta de nuevo."))
    } finally {
      setIsVerifying(false)
    }
  }

  const onResend = async () => {
    setError(null)
    setIsResending(true)
    try {
      await authService.resendVerificationCode(email)
      toast.success("Te enviamos un código nuevo. Revisa tu bandeja de entrada y la carpeta de spam.")
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo enviar un código nuevo. Intenta de nuevo."))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout
      title="Verifica tu correo"
      subtitle="Ingresa el código de 6 dígitos que enviamos a tu correo"
      footer={
        <Link to={`${ROUTING.LOGIN}?role=${role}`} className="font-semibold text-mathe-blue">
          Volver al inicio de sesión
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-5" noValidate>
        <div className="flex items-start gap-3 rounded-xl border border-mathe-blue/30 bg-mathe-surface px-4 py-3 text-sm text-mathe-ink">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-mathe-blue" />
          <p className="min-w-0 break-words">
            {firstEmailFailed
              ? "Tu cuenta fue creada, pero no pudimos enviar el código. Solicita uno nuevo para "
              : "Enviamos un código a "}
            <strong>{email}</strong>. Vence en 15 minutos. Si no lo ves, revisa la carpeta de spam.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <FormField
          label="Código de verificación"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          error={codeError}
          className="text-center text-lg tracking-[0.5em]"
        />

        <Button
          type="submit"
          disabled={isVerifying}
          className="h-11 rounded-pill bg-mathe-blue text-base font-semibold hover:bg-mathe-blue-deep"
        >
          {isVerifying ? "Verificando…" : "Verificar correo"}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isResending || cooldown > 0}
          onClick={() => void onResend()}
          className="h-11 rounded-pill text-base font-semibold"
        >
          {isResending
            ? "Enviando…"
            : cooldown > 0
              ? `Reenviar código (${cooldown} s)`
              : "Reenviar código"}
        </Button>
      </form>
    </AuthLayout>
  )
}
