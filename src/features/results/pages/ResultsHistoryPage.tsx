import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { motion } from "motion/react"
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  History,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { ROUTING } from "@/config/constant.config"
import { resultService, type MyResultsParams } from "../services/result.service"
import { toDisplayStyle, VAK_COLORS } from "../utils/vak"
import { VakBadge, type VakStyle } from "@/features/dashboard/components/VakBadge"
import type { QuizResult, VakStyleApi } from "../interfaces/result.interface"
import { cn } from "@/lib/utils"

const LIMIT = 8

// ── Animations ───────────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 0 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-mathe-border/60", className)} />
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-mathe-border bg-mathe-white px-5 py-4">
      <Skeleton className="size-9 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="hidden h-6 w-20 rounded-pill tablet:block" />
      <Skeleton className="hidden h-5 w-12 tablet:block" />
      <Skeleton className="hidden h-1.5 w-20 rounded-full tablet:block" />
      <Skeleton className="hidden size-7 rounded-xl tablet:block" />
    </div>
  )
}

// ── VAK Mini Bar ─────────────────────────────────────────────────────────────

function VakMiniBar({ v, a, k }: { v: number; a: number; k: number }) {
  return (
    <div className="flex h-1.5 w-20 overflow-hidden rounded-full">
      <div className="bg-mathe-blue" style={{ width: `${v}%` }} />
      <div className="bg-emerald-500" style={{ width: `${a}%` }} />
      <div className="bg-amber-500" style={{ width: `${k}%` }} />
    </div>
  )
}

// ── Style filter chips ────────────────────────────────────────────────────────

const STYLE_CHIPS: { label: string; value: VakStyleApi | "" }[] = [
  { label: "Todos", value: "" },
  { label: "Visual", value: "Visual" },
  { label: "Auditivo", value: "Auditory" },
  { label: "Kinestésico", value: "Kinesthetic" },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export function ResultsHistoryPage() {
  const navigate = useNavigate()

  const [styleFilter, setStyleFilter] = useState<VakStyleApi | "">("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [page, setPage] = useState(1)

  const [results, setResults] = useState<QuizResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const totalPages = Math.ceil(total / LIMIT)

  const fetchResults = useCallback(async () => {
    setLoading(true)
    try {
      const params: MyResultsParams = { page, limit: LIMIT }
      if (styleFilter) params.predominantStyle = styleFilter
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const data = await resultService.getMy(params)
      setResults(data.items)
      setTotal(data.total)
    } catch {
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, styleFilter, startDate, endDate])

  useEffect(() => { void fetchResults() }, [fetchResults])

  function applyFilter(fn: () => void) {
    fn()
    setPage(1)
  }

  const hasFilters = Boolean(styleFilter || startDate || endDate)

  return (
    <motion.div className="grid gap-8" initial="hidden" animate="show" variants={stagger}>

      {/* ── Header ── */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-mathe-surface">
              <History className="size-4 text-mathe-muted" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-wide text-mathe-muted">
              Mis resultados
            </p>
          </div>
          <h1 className="text-2xl font-bold text-mathe-ink">Historial de evaluaciones</h1>
          <p className="mt-2 max-w-md text-sm text-mathe-muted leading-relaxed">
            Consulta todas tus evaluaciones VAK, filtra por estilo de aprendizaje o rango de fechas
            y accede al detalle de cada resultado.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTING.DASHBOARD)}
          className="inline-flex h-10 items-center gap-2 rounded-pill bg-mathe-blue px-5 text-sm font-semibold text-mathe-white transition-colors hover:bg-mathe-blue/90"
        >
          <ClipboardList className="size-4" />
          Nueva evaluación
        </button>
      </motion.div>

      {/* ── Filters ── */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-mathe-border bg-mathe-white p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2 bor">
          <Filter className="size-4 text-mathe-muted" />
          <p className="text-sm font-semibold text-mathe-ink">Filtros</p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setStyleFilter("")
                setStartDate("")
                setEndDate("")
                setPage(1)
              }}
              className="ml-auto text-xs text-mathe-blue hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 justify-between">
          {/* Style chips */}
          <div className="flex flex-wrap gap-2">
            {STYLE_CHIPS.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => applyFilter(() => setStyleFilter(chip.value))}
                className={cn(
                  "h-8 rounded-pill px-3 text-xs font-semibold transition-colors",
                  styleFilter === chip.value
                    ? "bg-mathe-blue text-mathe-white shadow-sm"
                    : "border border-mathe-border bg-mathe-surface text-mathe-muted hover:border-mathe-blue/40 hover:text-mathe-blue",
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* <div className="hidden h-6 w-px bg-mathe-border tablet:block" /> */}

          {/* Date range */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-medium text-mathe-muted">Desde</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => applyFilter(() => setStartDate(e.target.value))}
              className="h-8 w-auto rounded-pill border-mathe-border text-xs"
            />
            <label className="text-xs font-medium text-mathe-muted">Hasta</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => applyFilter(() => setEndDate(e.target.value))}
              className="h-8 w-auto rounded-pill border-mathe-border text-xs"
            />
          </div>
        </div>
      </motion.div>

      {/* ── Results count ── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        {loading ? (
          <Skeleton className="h-4 w-40" />
        ) : (
          <p className="text-sm text-mathe-muted">
            {total === 0
              ? "Sin resultados"
              : `${total} resultado${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`}
            {styleFilter && ` · Estilo: ${toDisplayStyle(styleFilter as VakStyleApi)}`}
          </p>
        )}
      </motion.div>

      {/* ── List ── */}
      <motion.section variants={fadeUp} className="grid gap-3">

        {loading ? (
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-mathe-border bg-mathe-surface py-16 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-mathe-white shadow-sm">
              <History className="size-7 text-mathe-muted" />
            </span>
            <div>
              <p className="font-semibold text-mathe-ink">Sin resultados</p>
              <p className="mt-1 text-sm text-mathe-muted">
                {hasFilters
                  ? "Ningún resultado coincide con los filtros seleccionados."
                  : "Completa tu primer cuestionario para ver tu historial."}
              </p>
            </div>
            {!hasFilters && (
              <button
                type="button"
                onClick={() => navigate(ROUTING.DASHBOARD)}
                className="inline-flex h-10 items-center gap-2 rounded-pill border border-mathe-border bg-mathe-white px-5 text-sm font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface hover:text-mathe-blue"
              >
                <ClipboardList className="size-4" />
                Ir al inicio
              </button>
            )}
          </div>
        ) : (
          <motion.div className="grid gap-3" initial="hidden" animate="show" variants={stagger}>
            {results.map((r) => {
              const display = toDisplayStyle(r.predominantStyle)
              const { text } = VAK_COLORS[r.predominantStyle]
              return (
                <motion.button
                  key={r.id}
                  type="button"
                  onClick={() => navigate(`/dashboard/resultados/${r.id}`)}
                  variants={fadeUp}
                  className="grid w-full items-center gap-4 rounded-2xl border border-mathe-border bg-mathe-white px-5 py-4 text-left shadow-sm transition-all hover:border-mathe-blue/30 hover:bg-blue-50/20 hover:shadow-md
                    grid-cols-[2.25rem_1fr]
                    tablet:grid-cols-[2.25rem_1fr_auto_auto_auto_auto]"
                >
                  {/* Icon */}
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-mathe-surface text-mathe-muted">
                    <Calendar className="size-4" />
                  </span>

                  {/* Date + mobile details */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-mathe-ink">{formatDate(r.createdAt)}</p>
                    <p className="text-xs text-mathe-muted">{formatTime(r.createdAt)}</p>
                    {/* Mobile inline row */}
                    <div className="mt-2 flex flex-wrap items-center gap-2 tablet:hidden">
                      <VakBadge style={display as VakStyle} />
                      <span className={cn("text-sm font-bold tabular-nums", text)}>
                        {r.predominantConfidence}%
                      </span>
                      <VakMiniBar
                        v={r.visualProbability}
                        a={r.auditoryProbability}
                        k={r.kinestheticProbability}
                      />
                    </div>
                  </div>

                  {/* Desktop: badge */}
                  <VakBadge style={display as VakStyle} className="hidden tablet:inline-flex" />

                  {/* Desktop: confidence */}
                  <span
                    className={cn(
                      "hidden text-sm font-bold tabular-nums tablet:inline",
                      text,
                    )}
                  >
                    {r.predominantConfidence}%
                  </span>

                  {/* Desktop: mini bar + numbers */}
                  <div className="hidden items-center gap-2 tablet:flex">
                    <VakMiniBar
                      v={r.visualProbability}
                      a={r.auditoryProbability}
                      k={r.kinestheticProbability}
                    />
                    <span className="text-[11px] tabular-nums text-mathe-muted">
                      {r.visualProbability} / {r.auditoryProbability} / {r.kinestheticProbability}
                    </span>
                  </div>

                  {/* Desktop: arrow */}
                  <ArrowRight className="hidden size-4 shrink-0 text-mathe-muted tablet:block" />
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </motion.section>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="inline-flex h-9 items-center gap-1.5 rounded-pill border border-mathe-border px-4 text-sm font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
            Anterior
          </button>

          <p className="text-sm text-mathe-muted">
            Página <span className="font-semibold text-mathe-ink">{page}</span>{" "}
            de <span className="font-semibold text-mathe-ink">{totalPages}</span>
          </p>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            className="inline-flex h-9 items-center gap-1.5 rounded-pill border border-mathe-border px-4 text-sm font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
            <ChevronRight className="size-4" />
          </button>
        </motion.div>
      )}

    </motion.div>
  )
}
