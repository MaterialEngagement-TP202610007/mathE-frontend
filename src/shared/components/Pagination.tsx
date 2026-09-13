import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

/** Compact page selector: first, last and neighbours of the current page, with ellipses. */
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Página anterior"
        className="rounded-xl border-mathe-border shadow-sm"
      >
        <ChevronLeft className="size-4" />
      </Button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce<(number | "…")[]>((acc, p, i, arr) => {
          if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…")
          acc.push(p)
          return acc
        }, [])
        .map((p, i) =>
          p === "…" ? (
            <span key={`e-${i}`} className="grid size-9 place-items-center text-sm text-mathe-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={page === p ? "page" : undefined}
              className={cn(
                "grid size-9 place-items-center rounded-xl border text-sm font-semibold transition-colors",
                page === p
                  ? "border-mathe-blue bg-mathe-blue text-mathe-white shadow-sm"
                  : "border-mathe-border bg-mathe-white text-mathe-muted shadow-sm hover:bg-mathe-surface",
              )}
            >
              {p}
            </button>
          ),
        )}

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Página siguiente"
        className="rounded-xl border-mathe-border shadow-sm"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
