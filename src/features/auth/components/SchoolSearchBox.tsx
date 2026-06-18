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
import { listSchools, type School } from "@/shared/services/school.service"
import { cn } from "@/lib/utils"

interface SchoolSearchBoxProps {
  label: string
  name: string
  value: number | null
  displayValue: string
  onSelect: (school: School) => void
  error?: string
}

const SEARCH_LIMIT = 50
const ROW_HEIGHT = 40

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
        if (active) setResults(page.items)
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
              "flex h-11 w-full items-center justify-between rounded-pill border border-mathe-border bg-transparent px-4 text-left text-base outline-none",
              "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              "aria-invalid:border-destructive",
              value === null && "text-mathe-muted",
            )}
          >
            {displayValue || "Busca tu colegio"}
            <ChevronDown className="size-4 opacity-60" />
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
              onChange={(e) => setQuery(e.target.value)} autoComplete="off"
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
            <div ref={listRef} className="max-h-60 overflow-y-auto p-1">
              <div
                className="relative w-full"
                style={{ height: virtualizer.getTotalSize() }}
              >
                {virtualizer.getVirtualItems().map((row) => {
                  const school = results[row.index]
                  return (
                    <button
                      key={school.id}
                      type="button"
                      onClick={() => {
                        onSelect(school)
                        setOpen(false)
                      }}
                      className={cn(
                        "absolute left-0 top-0 flex w-full items-center truncate rounded-md px-3 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                        value === school.id &&
                          "bg-accent text-accent-foreground",
                      )}
                      style={{
                        height: row.size,
                        transform: `translateY(${row.start}px)`,
                      }}
                    >
                      {school.cenEdu}, {school.district}, {school.address}, {school.codMod}
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
