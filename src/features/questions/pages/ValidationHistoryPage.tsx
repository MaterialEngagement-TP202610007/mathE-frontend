import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Search,
  X,
  XCircle,
} from "lucide-react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { DatePickerInput } from "@/components/ui/date-picker"
import { questionService } from "../services/question.service"
import type { Question, QuestionStatus, VakStyleApi } from "../interfaces/question.interface"
import { VakBadge } from "@/features/dashboard/components/VakBadge"
import { toSpanishStyle, formatQuestionId, formatDate } from "@/features/dashboard/utils"
import { cn } from "@/lib/utils"
import { ROUTING } from "@/config/constant.config"

const PAGE_SIZE = 10

type StatusFilter = "all" | "approved" | "rejected"
type VakFilter = "all" | VakStyleApi

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "approved", label: "Aprobadas" },
  { value: "rejected", label: "Rechazadas" },
]

const VAK_TABS: { value: VakFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "Visual", label: "Visual" },
  { value: "Auditory", label: "Auditivo" },
  { value: "Kinesthetic", label: "Kinestésico" },
]

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-mathe-border/60", className)} />
}

function StatusBadge({ status }: { status: QuestionStatus }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-pill bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
        <CheckCircle2 className="size-3.5" />
        Aprobada
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 ring-1 ring-rose-200">
      <XCircle className="size-3.5" />
      Rechazada
    </span>
  )
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  const pages = useMemo(() => {
    const all = Array.from({ length: totalPages }, (_, i) => i + 1)
    return all
      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
      .reduce<(number | "…")[]>((acc, p, i, arr) => {
        if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…")
        acc.push(p)
        return acc
      }, [])
  }, [page, totalPages])

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="grid size-9 place-items-center rounded-xl border border-mathe-border bg-mathe-white text-mathe-muted shadow-sm transition-colors hover:bg-mathe-surface disabled:opacity-40"
        aria-label="Página anterior"
      >
        <ChevronLeft className="size-4" />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="grid size-9 place-items-center text-sm text-mathe-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p as number)}
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

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="grid size-9 place-items-center rounded-xl border border-mathe-border bg-mathe-white text-mathe-muted shadow-sm transition-colors hover:bg-mathe-surface disabled:opacity-40"
        aria-label="Página siguiente"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}

export function ValidationHistoryPage() {
  const navigate = useNavigate()
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [vakFilter, setVakFilter] = useState<VakFilter>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    questionService
      .listValidatedHistory({ page: 1, limit: 100 })
      .then((res) => setAllQuestions(res.items))
      .catch(() => setAllQuestions([]))
      .finally(() => setLoading(false))
  }, [])

  function resetPage() {
    setPage(1)
  }

  const approvedCount = useMemo(
    () => allQuestions.filter((q) => q.validationStatus === "approved").length,
    [allQuestions],
  )
  const rejectedCount = useMemo(
    () => allQuestions.filter((q) => q.validationStatus === "rejected").length,
    [allQuestions],
  )

  const filtered = useMemo(() => {
    let list = allQuestions
    if (statusFilter !== "all") {
      list = list.filter((q) => q.validationStatus === statusFilter)
    }
    if (vakFilter !== "all") {
      list = list.filter((q) => q.vakStyle === vakFilter)
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      list = list.filter(
        (q) =>
          formatQuestionId(q.id).toLowerCase().includes(term) ||
          q.statement.toLowerCase().includes(term),
      )
    }
    if (dateFrom) {
      list = list.filter((q) => new Date(q.generationDate) >= new Date(dateFrom))
    }
    if (dateTo) {
      list = list.filter(
        (q) => new Date(q.generationDate) <= new Date(dateTo + "T23:59:59"),
      )
    }
    return list
  }, [allQuestions, statusFilter, vakFilter, search, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const fromIdx = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const toIdx = Math.min(page * PAGE_SIZE, filtered.length)
  const hasDateFilter = Boolean(dateFrom || dateTo)

  return (
    <motion.div
      className="grid gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-mathe-ink">Historial de validación</h1>
          <p className="mt-1 text-sm text-mathe-muted">
            Preguntas aprobadas y rechazadas de tu historial
          </p>
        </div>

        {/* Summary chips */}
        {!loading && allQuestions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 className="size-3.5" />
              {approvedCount} aprobadas
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-600 ring-1 ring-rose-200">
              <XCircle className="size-3.5" />
              {rejectedCount} rechazadas
            </span>
          </div>
        )}
      </div>

      {/* ── Filters row 1: search + status ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-pill border border-mathe-border bg-mathe-white px-4 py-2.5 shadow-sm transition-colors focus-within:border-mathe-blue/50">
          <Search className="size-4 shrink-0 text-mathe-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              resetPage()
            }}
            placeholder="Buscar por ID o texto..."
            className="min-w-0 flex-1 bg-transparent text-sm text-mathe-ink placeholder:text-mathe-muted outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("")
                resetPage()
              }}
              className="shrink-0 text-mathe-muted transition-colors hover:text-mathe-ink"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-0.5 rounded-pill border border-mathe-border bg-mathe-white p-1 shadow-sm">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setStatusFilter(tab.value)
                resetPage()
              }}
              className={cn(
                "rounded-pill px-4 py-1.5 text-sm font-semibold transition-all",
                statusFilter === tab.value
                  ? "bg-mathe-blue text-mathe-white shadow-sm"
                  : "text-mathe-muted hover:text-mathe-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filters row 2: VAK + dates ── */}
      <div className="flex flex-wrap items-center gap-3 justify-between -mt-2">
        {/* VAK filter tabs */}
        <div className="flex items-center gap-0.5 rounded-pill border border-mathe-border bg-mathe-white p-1 shadow-sm">
          {VAK_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setVakFilter(tab.value)
                resetPage()
              }}
              className={cn(
                "rounded-pill px-4 py-1.5 text-sm font-semibold transition-all",
                vakFilter === tab.value
                  ? "bg-mathe-blue text-mathe-white shadow-sm"
                  : "text-mathe-muted hover:text-mathe-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <DatePickerInput
            value={dateFrom}
            onChange={(v) => { setDateFrom(v); resetPage() }}
            placeholder="Desde"
            className="w-40"
          />
          <span className="text-xs text-mathe-muted">—</span>
          <DatePickerInput
            value={dateTo}
            onChange={(v) => { setDateTo(v); resetPage() }}
            placeholder="Hasta"
            className="w-40"
          />
          {hasDateFilter && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => { setDateFrom(""); setDateTo(""); resetPage() }}
            >
              <X className="size-3" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl border border-mathe-border bg-mathe-white shadow-sm">
        {loading ? (
          <>
            <div className="border-b border-mathe-border bg-mathe-surface/60 px-6 py-3">
              <div className="flex gap-6">
                {[8, 12, 80, 16, 18, 14, 24].map((w, i) => (
                  <Skeleton key={i} className={`h-3 w-${w}`} />
                ))}
              </div>
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-6 border-b border-mathe-border px-6 py-4 last:border-0"
              >
                <Skeleton className="h-5 w-14 shrink-0" />
                <Skeleton className="h-6 w-20 shrink-0 rounded-pill" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-6 w-20 shrink-0 rounded-pill" />
                <Skeleton className="h-6 w-24 shrink-0 rounded-pill" />
                <Skeleton className="h-4 w-20 shrink-0" />
                <Skeleton className="h-4 w-32 shrink-0" />
              </div>
            ))}
          </>
        ) : paged.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-mathe-surface shadow-sm">
              <ClipboardCheck className="size-7 text-mathe-muted" />
            </span>
            <div>
              <p className="font-semibold text-mathe-ink">Sin resultados</p>
              <p className="mt-1 text-sm text-mathe-muted">
                {statusFilter !== "all" || vakFilter !== "all" || hasDateFilter || search
                  ? "Prueba ajustando los filtros"
                  : "Aún no hay preguntas validadas en tu historial"}
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-mathe-border bg-mathe-surface/60">
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                  ID
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                  Tipo
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                  Vista previa
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                  Estilo
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                  Estado
                </th>
                <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                  Fecha
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                  Motivo rechazo
                </th>
              </tr>
            </thead>
            <motion.tbody
              key={`${page}-${statusFilter}-${vakFilter}-${dateFrom}-${dateTo}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {paged.map((q) => (
                <tr
                  key={q.id}
                  className="group cursor-pointer border-b border-mathe-border transition-colors last:border-0 hover:bg-blue-50/30"
                  onClick={() => navigate(`${ROUTING.DASHBOARD_VALIDATION_HISTORY}/${q.id}`)}
                >
                  {/* Left accent stripe by status */}
                  <td className="relative px-6 py-4">
                    <span
                      className={cn(
                        "absolute inset-y-0 left-0 w-0.5 rounded-r transition-opacity",
                        q.validationStatus === "approved"
                          ? "bg-emerald-400 opacity-0 group-hover:opacity-100"
                          : "bg-rose-400 opacity-0 group-hover:opacity-100",
                      )}
                    />
                    <span className="font-mono text-sm font-semibold text-mathe-blue">
                      {formatQuestionId(q.id)}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <VakBadge style={toSpanishStyle(q.vakStyle)} />
                  </td>
                  <td className="px-3 py-4">
                    <p className="max-w-xs truncate text-sm text-mathe-ink">{q.statement}</p>
                  </td>
                  <td className="px-3 py-4">
                    <VakBadge style={toSpanishStyle(q.vakStyle)} />
                  </td>
                  <td className="px-3 py-4">
                    <StatusBadge status={q.validationStatus} />
                  </td>
                  <td className="px-3 py-4 text-sm text-mathe-muted">
                    {formatDate(q.generationDate)}
                  </td>
                  <td className="px-6 py-4">
                    {q.rejectionReason ? (
                      <p className="max-w-[14rem] text-xs font-medium text-amber-600 leading-snug">
                        {q.rejectionReason}
                      </p>
                    ) : (
                      <span className="text-sm text-mathe-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </motion.tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-mathe-muted">
            Mostrando{" "}
            <span className="font-semibold text-mathe-ink">{fromIdx}–{toIdx}</span> de{" "}
            <span className="font-semibold text-mathe-ink">{filtered.length}</span> preguntas
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}

    </motion.div>
  )
}
