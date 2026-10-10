import { ArrowRight, ClipboardList, RotateCcw, TriangleAlert } from "lucide-react"
import { Link } from "react-router"
import { ROUTING } from "@/config/constant.config"
import { cn } from "@/lib/utils"

interface GeneratingQuizProps {
  ready: boolean
  /** Generation failed: shows the message with a retry instead of the progress state. */
  error?: string | null
  onContinue: () => void
  onRetry?: () => void
}

export function GeneratingQuiz({ ready, error, onContinue, onRetry }: GeneratingQuizProps) {
  if (error) {
    return (
      <div
        role="alert"
        className="flex w-full max-w-md flex-col items-center text-center animate-fade-in animate-duration-slow"
      >
        <span className="grid size-16 place-items-center rounded-2xl bg-amber-50 text-amber-600">
          <TriangleAlert className="size-7" />
        </span>
        <h1 className="mt-8 text-2xl font-bold text-mathe-ink tablet:text-3xl">
          No pudimos generar tu cuestionario
        </h1>
        <p className="mt-2 text-mathe-muted">{error}</p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-mathe-blue px-8 text-sm font-semibold text-mathe-white transition-colors hover:bg-mathe-blue-deep"
        >
          <RotateCcw className="size-4" />
          Reintentar
        </button>
        <Link
          to={ROUTING.DASHBOARD}
          replace
          className="mt-4 inline-flex h-11 items-center justify-center rounded-pill px-6 text-sm font-semibold text-mathe-muted transition-colors hover:bg-mathe-white hover:text-mathe-ink"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center text-center animate-fade-in animate-duration-slow">
      <div className="relative grid size-32 place-items-center">
        <span
          className={cn(
            "absolute inset-0 rounded-full bg-mathe-blue/10 transition-opacity",
            ready ? "opacity-0" : "animate-ping-sm",
          )}
        />
        <svg
          viewBox="0 0 100 100"
          className={cn(
            "absolute inset-0 size-full",
            !ready && "animate-spin [animation-duration:1.5s]",
          )}
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="var(--color-mathe-border)"
            strokeWidth="5"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="var(--color-mathe-blue)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={ready ? "276" : "70 206"}
            className="transition-[stroke-dasharray] duration-500"
          />
        </svg>
        <span
          className={cn(
            "grid size-16 place-items-center rounded-2xl transition-colors duration-500",
            ready
              ? "bg-mathe-blue text-mathe-white"
              : "bg-mathe-white text-mathe-blue shadow-sm",
          )}
        >
          <ClipboardList className="size-7" />
        </span>
      </div>

      <h1 className="mt-8 text-2xl font-bold text-mathe-ink tablet:text-3xl">
        {ready ? "¡Listo para comenzar!" : "Generando tu cuestionario…"}
      </h1>
      <p className="mt-2 text-mathe-muted">
        {ready
          ? "Tus preguntas personalizadas están preparadas."
          : "Estamos preparando preguntas personalizadas para ti."}
      </p>

      <button
        type="button"
        onClick={onContinue}
        disabled={!ready}
        className={cn(
          "mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-pill px-8 text-sm font-semibold transition-all",
          ready
            ? "bg-mathe-blue text-mathe-white hover:bg-mathe-blue-deep"
            : "cursor-not-allowed bg-mathe-white text-mathe-muted shadow-sm",
        )}
      >
        Continuar
        {ready && <ArrowRight className="size-4" />}
      </button>

      <p className="mt-6 text-xs text-mathe-muted">
        {ready
          ? "Pulsa continuar cuando estés preparado"
          : "Este proceso puede tomar unos segundos"}
      </p>
    </div>
  )
}
