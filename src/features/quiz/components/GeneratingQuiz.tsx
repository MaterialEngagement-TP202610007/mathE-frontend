import { ArrowRight, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"

interface GeneratingQuizProps {
  ready: boolean
  onContinue: () => void
}

export function GeneratingQuiz({ ready, onContinue }: GeneratingQuizProps) {
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
