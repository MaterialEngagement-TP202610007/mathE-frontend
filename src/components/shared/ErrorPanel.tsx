import { LifeBuoy, RotateCcw, TriangleAlert } from "lucide-react"
import { getSupportMailto } from "@/config/env.config"
import { cn } from "@/lib/utils"

interface ErrorPanelProps {
  title: string
  message: string
  /** Re-runs the failed action. Omit to hide "Reintentar". */
  onRetry?: () => void
  /** Disables the retry button while the action is running again. */
  retrying?: boolean
  /** Subject prefilled in the support e-mail. */
  supportSubject?: string
  className?: string
}

/**
 * HU-54: recoverable error state with "Reintentar" and, when VITE_SUPPORT_EMAIL is
 * configured, a "Contactar soporte" mailto link. Without the env var the link is hidden.
 */
export function ErrorPanel({
  title,
  message,
  onRetry,
  retrying = false,
  supportSubject,
  className,
}: ErrorPanelProps) {
  const supportHref = getSupportMailto(supportSubject)

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border border-mathe-border bg-mathe-white px-6 py-12 text-center shadow-sm",
        className,
      )}
    >
      <span className="grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
        <TriangleAlert className="size-7" />
      </span>
      <div>
        <h2 className="text-xl font-bold text-mathe-ink">{title}</h2>
        <p className="mt-1 max-w-md text-sm text-mathe-muted">{message}</p>
      </div>

      {(onRetry || supportHref) && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-mathe-blue px-6 text-sm font-semibold text-mathe-white transition-colors hover:bg-mathe-blue-deep disabled:opacity-60"
            >
              <RotateCcw className={cn("size-4", retrying && "animate-spin")} />
              Reintentar
            </button>
          )}
          {supportHref && (
            <a
              href={supportHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-mathe-border px-6 text-sm font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface"
            >
              <LifeBuoy className="size-4" />
              Contactar soporte
            </a>
          )}
        </div>
      )}
    </div>
  )
}
