import { Link } from "react-router"
import { MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUTING } from "@/config/constant.config"
import { AuthLayout } from "../components/AuthLayout"

export function RegisterPendingPage() {
  return (
    <AuthLayout title="Cuenta en revisión">
      <div className="grid gap-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-mathe-surface text-mathe-blue">
          <MailCheck className="size-8" />
        </div>
        <p className="text-mathe-muted">
          Tu cuenta fue creada correctamente. Un administrador debe activarla
          antes de que puedas iniciar sesión. Te avisaremos cuando esté lista.
        </p>
        <Button
          asChild
          className="h-11 rounded-pill bg-mathe-blue text-base font-semibold hover:bg-mathe-blue-deep"
        >
          <Link to={ROUTING.LOGIN}>Volver al inicio de sesión</Link>
        </Button>
      </div>
    </AuthLayout>
  )
}
