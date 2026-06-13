import { useEffect, useId, useState } from "react"
import { useNavigate } from "react-router"
import {
  Check,
  DatabaseZap,
  LogOut,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react"
import { ROUTING } from "@/config/constant.config"
import { cn } from "@/lib/utils"
import { useQuizIntroStore } from "../store/quiz-intro.store"

const TERMS = [
  {
    icon: DatabaseZap,
    title: "Recopilación de datos",
    body: "Durante el cuestionario registramos tus respuestas y métricas de interacción (tiempo, clics y cambios) para estimar tu estilo de aprendizaje.",
  },
  {
    icon: Sparkles,
    title: "Uso para entrenamiento",
    body: "Si aceptas, estos datos podrán usarse de forma anonimizada para entrenar y mejorar el modelo de clasificación de Math.E.",
  },
  {
    icon: LogOut,
    title: "Puedes abandonar",
    body: "Eres libre de abandonar el cuestionario en cualquier momento. Si lo haces, no se conservarán los resultados de esa sesión.",
  },
]

export function TermsModal() {
  const isOpen = useQuizIntroStore((s) => s.isOpen)
  const close = useQuizIntroStore((s) => s.close)
  const accept = useQuizIntroStore((s) => s.accept)
  const navigate = useNavigate()
  const [checked, setChecked] = useState(false)
  const checkboxId = useId()

  const handleClose = () => {
    setChecked(false)
    close()
  }

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose()
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  if (!isOpen) return null

  const onStart = () => {
    if (!checked) return
    setChecked(false)
    accept()
    navigate(ROUTING.QUIZ)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={handleClose}
        className="absolute inset-0 bg-mathe-ink/40 backdrop-blur-sm animate-fade-in animate-duration-fast"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-mathe-border bg-mathe-white shadow-2xl animate-fade-in-up animate-duration-normal">
        <div className="flex items-start gap-4 bg-mathe-surface px-7 pt-7 pb-6">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-mathe-blue text-mathe-white">
            <ShieldCheck className="size-6" />
          </span>
          <div className="pr-8">
            <h2
              id="terms-title"
              className="text-xl font-bold text-mathe-ink"
            >
              Antes de empezar
            </h2>
            <p className="mt-1 text-sm text-mathe-muted">
              Términos y condiciones sobre el uso de tus datos.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="absolute right-5 top-5 grid size-9 place-items-center rounded-full text-mathe-muted transition-colors hover:bg-mathe-white hover:text-mathe-ink"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid gap-5 px-7 py-6">
          {TERMS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-3.5">
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-mathe-surface text-mathe-blue">
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-mathe-ink">{title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-mathe-muted">
                  {body}
                </p>
              </div>
            </div>
          ))}

          <label
            htmlFor={checkboxId}
            className={cn(
              "mt-1 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
              checked
                ? "border-mathe-blue bg-mathe-surface"
                : "border-mathe-border hover:bg-mathe-surface/60",
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors",
                checked
                  ? "border-mathe-blue bg-mathe-blue text-mathe-white"
                  : "border-mathe-border bg-mathe-white",
              )}
            >
              {checked && <Check className="size-3.5" strokeWidth={3} />}
            </span>
            <input
              id={checkboxId}
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="sr-only"
            />
            <span className="text-sm text-mathe-ink">
              He leído y acepto los términos y autorizo el uso de mis datos para
              fines de entrenamiento del modelo.
            </span>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-mathe-border px-7 py-5 tablet:flex-row tablet:justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-12 items-center justify-center rounded-pill px-6 text-sm font-semibold text-mathe-muted transition-colors hover:bg-mathe-surface hover:text-mathe-ink"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onStart}
            disabled={!checked}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-mathe-blue px-7 text-sm font-semibold text-mathe-white transition-colors hover:bg-mathe-blue-deep disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-mathe-blue"
          >
            Iniciar cuestionario
          </button>
        </div>
      </div>
    </div>
  )
}
