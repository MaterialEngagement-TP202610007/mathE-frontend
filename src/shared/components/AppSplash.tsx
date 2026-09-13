import { useEffect, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { MatheLogo } from "@/shared/components/icons/MatheLogo"

/** Delay before hinting that the backend may be waking up (free-tier cold start). */
const SLOW_HINT_DELAY_MS = 8_000

interface AppSplashProps {
  /** When set, the splash stops spinning and offers a manual retry. */
  onRetry?: () => void
}

/** Full-screen boot screen shown while the session is being resolved. */
export function AppSplash({ onRetry }: AppSplashProps) {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    if (onRetry) return
    const id = setTimeout(() => setSlow(true), SLOW_HINT_DELAY_MS)
    return () => clearTimeout(id)
  }, [onRetry])

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-svh flex-col items-center justify-center gap-6 bg-mathe-surface px-6 text-center"
    >
      <MatheLogo width={140} height={65} />

      {onRetry ? (
        <>
          <div className="grid gap-2">
            <p className="text-lg font-semibold text-mathe-ink">
              No pudimos conectar con el servidor
            </p>
            <p className="max-w-sm text-sm text-mathe-muted">
              Revisa tu conexión o intenta de nuevo en unos segundos.
            </p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-11 items-center gap-2 rounded-pill bg-mathe-blue px-6 text-sm font-semibold text-mathe-white transition-colors hover:bg-mathe-blue/90"
          >
            <RefreshCw className="size-4" />
            Reintentar
          </button>
        </>
      ) : (
        <>
          <Loader2 className="size-8 animate-spin text-mathe-blue" />
          <div className="grid gap-2">
            <p className="text-lg font-semibold text-mathe-ink">Conectando con el servidor…</p>
            {slow && (
              <p className="max-w-sm text-sm text-mathe-muted">
                El servidor puede estar iniciando. Esto puede tardar hasta un minuto la primera vez.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
