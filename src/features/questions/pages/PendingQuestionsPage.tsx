import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { ChevronLeft, ChevronRight, ClipboardList, Sparkles, X } from "lucide-react"
import { motion } from "motion/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DatePickerInput } from "@/components/ui/date-picker"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { questionService } from "../services/question.service"
import type { Question, VakStyleApi } from "../interfaces/question.interface"
import { VakBadge } from "@/features/dashboard/components/VakBadge"
import { toSpanishStyle, formatQuestionId, formatDate } from "@/features/dashboard/utils"
import { cn } from "@/lib/utils"
import { ROUTING } from "@/config/constant.config"
import { GenerateQuestionsModal } from "../components/GenerateQuestionsModal"
import { GeneratingOverlay } from "../components/GeneratingOverlay"

const PAGE_SIZE = 10

type VakFilter = "all" | VakStyleApi

const VAK_TABS: { value: VakFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "Visual", label: "Visual" },
  { value: "Auditory", label: "Auditivo" },
  { value: "Kinesthetic", label: "Kinestésico" },
]

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-mathe-border/60", className)} />
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
          <span
            key={`ellipsis-${i}`}
            className="grid size-9 place-items-center text-sm text-mathe-muted"
          >
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

export function PendingQuestionsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  const [vakFilter, setVakFilter] = useState<VakFilter>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)

  const [showModal, setShowModal] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    questionService
      .listMy({ status: "pending", page: 1, limit: 100 })
      .then((res) => setAllQuestions(res.items))
      .catch(() => setAllQuestions([]))
      .finally(() => setLoading(false))
  }, [])

  function handleVakFilter(v: VakFilter) {
    setVakFilter(v)
    setPage(1)
  }

  function handleDateFrom(v: string) {
    setDateFrom(v)
    setPage(1)
  }

  function handleDateTo(v: string) {
    setDateTo(v)
    setPage(1)
  }

  function clearDates() {
    setDateFrom("")
    setDateTo("")
    setPage(1)
  }

  async function handleGenerate(count: number, vakStyle: VakStyleApi) {
    setGenerating(true)
    try {
      await questionService.generateBatch({ count, vakStyle, teacherId: user?.id })
      toast.success(`${count} preguntas generadas correctamente. Ya puedes revisarlas abajo.`)
      const res = await questionService.listMy({ status: "pending", page: 1, limit: 100 })
      setAllQuestions(res.items)
      setPage(1)
    } catch {
      toast.error("Error al generar las preguntas. Intenta de nuevo.")
    } finally {
      setGenerating(false)
    }
  }

  const filtered = useMemo(() => {
    let list = allQuestions
    if (vakFilter !== "all") {
      list = list.filter((q) => q.vakStyle === vakFilter)
    }
    if (dateFrom) {
      list = list.filter((q) => new Date(q.createdAt) >= new Date(dateFrom))
    }
    if (dateTo) {
      list = list.filter((q) => new Date(q.createdAt) <= new Date(dateTo + "T23:59:59"))
    }
    return list
  }, [allQuestions, vakFilter, dateFrom, dateTo])

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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-mathe-ink">Preguntas pendientes</h1>
          <p className="mt-1 text-sm text-mathe-muted">
            Revisa y valida las preguntas generadas por IA
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex h-11 items-center gap-2 rounded-pill bg-mathe-blue px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-mathe-blue/90"
        >
          <Sparkles className="size-4" />
          Generar preguntas
        </button>
      </div>

      <GenerateQuestionsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onGenerate={handleGenerate}
      />
      <GeneratingOverlay visible={generating} />

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        {/* VAK filter tabs */}
        <div className="flex items-center gap-0.5 rounded-pill border border-mathe-border bg-mathe-white p-1 shadow-sm">
          {VAK_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleVakFilter(tab.value)}
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
            onChange={handleDateFrom}
            placeholder="Desde"
            className="w-40"
          />
          <span className="text-xs text-mathe-muted">—</span>
          <DatePickerInput
            value={dateTo}
            onChange={handleDateTo}
            placeholder="Hasta"
            className="w-40"
          />
          {hasDateFilter && (
            <Button type="button" variant="ghost" size="xs" onClick={clearDates}>
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
                {[8, 12, 80, 20, 16].map((w, i) => (
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
                <Skeleton className="h-4 w-20 shrink-0" />
                <Skeleton className="h-9 w-20 shrink-0 rounded-pill" />
              </div>
            ))}
          </>
        ) : paged.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-mathe-surface shadow-sm">
              <ClipboardList className="size-7 text-mathe-muted" />
            </span>
            <div>
              <p className="font-semibold text-mathe-ink">Sin resultados</p>
              <p className="mt-1 text-sm text-mathe-muted">
                {vakFilter !== "all" || hasDateFilter
                  ? "Prueba ajustando los filtros"
                  : "No hay preguntas pendientes de revisión"}
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
                  Generada
                </th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                  Acciones
                </th>
              </tr>
            </thead>
            <motion.tbody
              key={`${page}-${vakFilter}-${dateFrom}-${dateTo}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {paged.map((q) => (
                <tr
                  key={q.id}
                  className="border-b border-mathe-border transition-colors last:border-0 hover:bg-blue-50/40"
                >
                  <td className="px-6 py-4">
                    <code className="font-mono text-sm font-semibold text-mathe-blue">
                      {formatQuestionId(q.id)}
                    </code>
                  </td>
                  <td className="px-3 py-4">
                    <VakBadge style={toSpanishStyle(q.vakStyle)} />
                  </td>
                  <td className="px-3 py-4">
                    <p className="max-w-xl truncate text-sm text-mathe-ink">{q.statement}</p>
                  </td>
                  <td className="px-3 py-4 text-sm text-mathe-muted">
                    {formatDate(q.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`${ROUTING.DASHBOARD_QUESTIONS}/${q.id}`)}
                      className="inline-flex h-9 items-center rounded-pill bg-mathe-blue px-4 text-xs font-semibold text-mathe-white transition-colors hover:bg-mathe-blue/90"
                    >
                      Revisar
                    </button>
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
            Mostrando <span className="font-semibold text-mathe-ink">{fromIdx}–{toIdx}</span> de{" "}
            <span className="font-semibold text-mathe-ink">{filtered.length}</span> preguntas
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}

    </motion.div>
  )
}
