import { useEffect } from "react"
import { AlertTriangle, X } from "lucide-react"

interface AbandonDialogProps {
  onConfirm: () => void
  onCancel: () => void
}

export function AbandonDialog({ onConfirm, onCancel }: AbandonDialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [onCancel])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="abandon-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCancel}
        className="absolute inset-0 bg-mathe-ink/40 backdrop-blur-sm animate-fade-in animate-duration-fast"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-mathe-border bg-mathe-white shadow-2xl animate-fade-in-up animate-duration-normal">
        <div className="flex items-start gap-4 px-7 pt-7 pb-6">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertTriangle className="size-6" />
          </span>
          <div className="pr-8">
            <h2 id="abandon-title" className="text-lg font-bold text-mathe-ink">
              ¿Abandonar el cuestionario?
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-mathe-muted">
              Si abandonas ahora, tus respuestas no se conservarán. Podrás iniciar
              un nuevo cuestionario desde tu panel de inicio.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar"
            className="absolute right-5 top-5 grid size-9 place-items-center rounded-full text-mathe-muted transition-colors hover:bg-mathe-surface hover:text-mathe-ink"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-mathe-border px-7 py-5 tablet:flex-row tablet:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-12 items-center justify-center rounded-pill px-6 text-sm font-semibold text-mathe-muted transition-colors hover:bg-mathe-surface hover:text-mathe-ink"
          >
            Continuar cuestionario
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-12 items-center justify-center rounded-pill bg-red-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Abandonar
          </button>
        </div>
      </div>
    </div>
  )
}
