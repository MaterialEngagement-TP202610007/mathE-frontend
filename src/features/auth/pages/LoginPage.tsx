import { useState, type FormEvent } from "react"
import { ArrowRight } from "lucide-react"
import { Link, useSearchParams } from "react-router"
import { Button } from "@/components/ui/button"
import { ROUTING } from "@/config/constant.config"
import { toFieldErrors } from "@/lib/form"
import { accountNoun, type AccountType } from "../types/account-type"
import { AccountTypeTabs } from "../components/AccountTypeTabs"
import { AuthLayout } from "../components/AuthLayout"
import { FormField } from "../components/FormField"
import { useLogin } from "../hooks/use-login"
import { loginSchema } from "../schemas/auth.schema"

export function LoginPage() {
  const { login, isLoading, error } = useLogin()
  const [searchParams, setSearchParams] = useSearchParams()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const accountType: AccountType =
    searchParams.get("role") === "teacher" ? "teacher" : "student"
  const noun = accountNoun(accountType)

  const onAccountChange = (value: AccountType) =>
    setSearchParams({ role: value }, { replace: true })

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const parsed = loginSchema.safeParse(data)
    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error))
      return
    }
    setFieldErrors({})
    void login(parsed.data)
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Selecciona tu tipo de cuenta para continuar"
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link
            to={`${ROUTING.REGISTER}?role=${accountType}`}
            className="font-semibold text-mathe-blue"
          >
            Regístrate como {noun}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-5" noValidate>
        <AccountTypeTabs value={accountType} onChange={onAccountChange} />

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <FormField
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          error={fieldErrors.email}
        />
        <FormField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={fieldErrors.password}
        />

        <div className="-mt-2 flex justify-end">
          <Link
            to={ROUTING.LOGIN}
            className="text-sm font-semibold text-mathe-blue hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-11 rounded-pill bg-mathe-blue text-base font-semibold hover:bg-mathe-blue-deep"
        >
          {isLoading ? (
            "Ingresando…"
          ) : (
            <>
              Entrar como {noun}
              <ArrowRight className="size-5" />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}
