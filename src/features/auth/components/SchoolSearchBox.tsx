import { useEffect, useRef, useState } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { ChevronDown, Loader2, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useDebounce } from "@/shared/hooks/use-debounce"
import {
  listSchools,
  MAX_SCHOOLS_PAGE_SIZE,
  type School,
} from "@/shared/services/school.service"
import { cn } from "@/lib/utils"

interface SchoolSearchBoxProps {
  label: string
  name: string
  value: number | null
  /** Label of the selected school — pass `formatSchoolLabel(school)` (name · district). */
  displayValue: string
  onSelect: (school: School) => void
  error?: string
}

const SEARCH_LIMIT = MAX_SCHOOLS_PAGE_SIZE
const ROW_HEIGHT = 60

/** Defensive guard: the backend returns one row per school, but never render a school twice. */
function uniqueById(schools: School[]): School[] {
  const seen = new Set<number>()
  return schools.filter((school) => {
    if (seen.has(school.id)) return false
    seen.add(school.id)
    return true
  })
}

export function SchoolSearchBox({
  label,
  name,
  value,
  displayValue,
  onSelect,
  error,
}: SchoolSearchBoxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<School[]>([])
  const [loading, setLoading] = useState(false)
  const debounced = useDebounce(query, 350)

  const listRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  })

  useEffect(() => {
    if (!open) return
    let active = true
    const run = async () => {
      setLoading(true)
      try {
        const page = await listSchools({
          search: debounced.trim(),
          limit: SEARCH_LIMIT,
        })
        if (active) setResults(uniqueById(page.items))
      } catch {
        if (active) setResults([])
      } finally {
        if (active) setLoading(false)
      }
    }
    void run()
    return () => {
      active = false
    }
  }, [debounced, open])

  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={name}
            type="button"
            aria-invalid={Boolean(error)}
            className={cn(
              "flex h-11 w-full items-center justify-between gap-2 rounded-pill border border-mathe-border bg-transparent px-4 text-left text-base outline-none",
              "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              "aria-invalid:border-destructive",
              value === null && "text-mathe-muted",
            )}
          >
            <span className="min-w-0 truncate">{displayValue || "Busca tu colegio"}</span>
            <ChevronDown className="size-4 shrink-0 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0"
          align="start"
        >
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="size-4 shrink-0 text-mathe-muted" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
              placeholder="Escribe el nombre del colegio…"
              className="h-11 rounded-none border-0 px-0 shadow-none focus-visible:ring-0"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-mathe-muted">
              <Loader2 className="size-4 animate-spin" />
              Buscando…
            </div>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-sm text-mathe-muted">
              No se encontraron colegios.
            </p>
          ) : (
            <div ref={listRef} className="max-h-72 overflow-y-auto p-1">
              <div
                className="relative w-full"
                style={{ height: virtualizer.getTotalSize() }}
              >
                {virtualizer.getVirtualItems().map((row) => {
                  const school = results[row.index]
                  const location = [school.district, school.address]
                    .filter(Boolean)
                    .join(" · ")
                  const levels = (school.levels ?? []).filter(Boolean)
                  return (
                    <button
                      key={school.id}
                      type="button"
                      onClick={() => {
                        onSelect(school)
                        setOpen(false)
                      }}
                      aria-pressed={value === school.id}
                      className={cn(
                        "absolute left-0 top-0 flex w-full flex-col justify-center gap-0.5 rounded-md px-3 text-left outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent",
                        value === school.id &&
                          "bg-accent text-accent-foreground",
                      )}
                      style={{
                        height: row.size,
                        transform: `translateY(${row.start}px)`,
                      }}
                    >
                      <span className="flex w-full min-w-0 items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-mathe-ink">
                          {school.cenEdu}
                        </span>
                        {levels.length > 0 && (
                          <span className="flex shrink-0 gap-1">
                            {levels.map((level) => (
                              <span
                                key={level}
                                className="rounded-pill bg-mathe-surface px-2 py-0.5 text-[10px] font-semibold text-mathe-muted"
                              >
                                {level}
                              </span>
                            ))}
                          </span>
                        )}
                      </span>
                      {location && (
                        <span className="w-full truncate text-xs text-mathe-muted">
                          {location}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
