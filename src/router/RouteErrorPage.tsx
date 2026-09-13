import { useEffect } from "react"
import { isRouteErrorResponse, useRouteError } from "react-router"
import { Home, RefreshCw, TriangleAlert } from "lucide-react"
import { ROUTING } from "@/config/constant.config"
import { MatheLogo } from "@/shared/components/icons/MatheLogo"

/** Root `errorElement`: catches render errors and unmatched loaders anywhere in the tree. */
export function RouteErrorPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-mathe-surface px-6 text-center">
      <MatheLogo width={120} height={56} />

      <span className="grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm">
        <TriangleAlert className="size-7" />
      </span>

      <div className="grid max-w-md gap-2">
        <h1 className="text-2xl font-bold text-mathe-ink">
          {notFound ? "Página no encontrada" : "Algo salió mal"}
        </h1>
        <p className="text-sm text-mathe-muted">
          {notFound
            ? "La página que buscas no existe o fue movida."
            : "Ocurrió un error inesperado al mostrar esta página. Puedes volver al inicio o recargar."}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Full navigation on purpose: resets any broken in-memory state. */}
        <a
          href={ROUTING.HOME}
          className="inline-flex h-11 items-center gap-2 rounded-pill bg-mathe-blue px-6 text-sm font-semibold text-mathe-white transition-colors hover:bg-mathe-blue/90"
        >
          <Home className="size-4" />
          Volver al inicio
        </a>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex h-11 items-center gap-2 rounded-pill border border-mathe-border bg-mathe-white px-6 text-sm font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface"
        >
          <RefreshCw className="size-4" />
          Recargar
        </button>
      </div>
    </div>
  )
}
