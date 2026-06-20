import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { ArrowLeft, Bot, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react"
import { motion } from "motion/react"
import { VakBadge } from "@/features/dashboard/components/VakBadge"
import { userService } from "@/features/users/services/user.service"
import { resultService } from "../services/result.service"
import { toDisplayStyle } from "../utils/vak"
import { ACADEMIC_GRADES } from "@/data/academic-grades"
import type { QuizResult } from "../interfaces/result.interface"
import type { User } from "@/features/users/interfaces/user.interface"
import { cn } from "@/lib/utils"

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric", month: "short", year: "numeric",
  })
}

function gradeName(id: number | null) {
  if (!id) return "—"
  const g = ACADEMIC_GRADES.find((a) => a.id === id)
  return g ? g.name : `Grado ${id}`
}

const CLASSIFIER_LABEL: Record<string, string> = {
  xgboost:      "XGBoost",
  simple_score: "Score simple",
}

const PAGE_SIZE = 10

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-mathe-border/60", className)} />
}

// ── Animations ────────────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
        className="grid size-9 place-items-center rounded-xl border border-mathe-border bg-mathe-white text-mathe-muted shadow-sm transition-colors hover:bg-mathe-surface disabled:opacity-40">
        <ChevronLeft className="size-4" />
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button key={p} type="button" onClick={() => onChange(p)}
          className={cn(
            "grid size-9 place-items-center rounded-xl border text-sm font-semibold transition-colors",
            page === p
              ? "border-mathe-blue bg-mathe-blue text-white"
              : "border-mathe-border bg-mathe-white text-mathe-muted hover:bg-mathe-surface"
          )}>
          {p}
        </button>
      ))}
      <button type="button" onClick={() => onChange(Math.min(total, page + 1))} disabled={page === total}
        className="grid size-9 place-items-center rounded-xl border border-mathe-border bg-mathe-white text-mathe-muted shadow-sm transition-colors hover:bg-mathe-surface disabled:opacity-40">
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function StudentResultsHistoryPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()

  const [student, setStudent] = useState<User | null>(null)
  const [studentLoading, setStudentLoading] = useState(true)

  const [results, setResults] = useState<QuizResult[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const id = Number(studentId)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    if (!id) return
    userService.getById(id)
      .then(setStudent)
      .catch(() => setStudent(null))
      .finally(() => setStudentLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    resultService
      .listAll({ studentId: id, page, limit: PAGE_SIZE })
      .then((res) => {
        setResults(res.items)
        setTotal(res.total)
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [id, page])

  const initials = student ? getInitials(student.name) : "?"

  return (
    <motion.div className="grid gap-6" initial="hidden" animate="show" variants={stagger}>

      {/* ── Back + Header ── */}
      <motion.div variants={fadeUp}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mathe-muted transition-colors hover:text-mathe-ink"
        >
          <ArrowLeft className="size-4" />
          Volver a reportes
        </button>

        <div className="flex items-center gap-4">
          {studentLoading ? (
            <>
              <Skeleton className="size-14 rounded-full" />
              <div className="grid gap-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </>
          ) : (
            <>
              <div className="grid size-14 shrink-0 place-items-center rounded-full bg-mathe-blue/10 text-xl font-bold text-mathe-blue">
                {initials}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-mathe-ink">{student?.name ?? `Estudiante #${id}`}</h1>
                <p className="mt-0.5 text-sm text-mathe-muted">
                  {student?.email} · {gradeName(student?.academicGradeId ?? null)}
                </p>
              </div>
            </>
          )}
        </div>
        <p className="mt-3 text-sm text-mathe-muted">
          Historial completo de evaluaciones VAK realizadas por este estudiante a lo largo del tiempo.
        </p>
      </motion.div>

      {/* ── Results table ── */}
      <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-mathe-border bg-mathe-white shadow-sm">

        {loading ? (
          <>
            <div className="border-b border-mathe-border bg-mathe-surface/60 px-6 py-3 flex gap-6">
              {[16, 24, 20, 16, 20].map((w, i) => <Skeleton key={i} className={`h-3 w-${w}`} />)}
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-6 border-b border-mathe-border px-6 py-4 last:border-0">
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-6 w-24 rounded-pill" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-mathe-surface shadow-sm">
              <ClipboardList className="size-7 text-mathe-muted" />
            </span>
            <div>
              <p className="font-semibold text-mathe-ink">Sin evaluaciones registradas</p>
              <p className="mt-1 text-sm text-mathe-muted">Este estudiante aún no ha completado ningún cuestionario.</p>
            </div>
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-mathe-border bg-mathe-surface/60">
                {["#", "Estilo predominante", "Confianza", "Clasificador", "Fecha"].map((h) => (
                  <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <motion.tbody key={page} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-mathe-border last:border-0 hover:bg-blue-50/30 transition-colors">
                  <td className="px-5 py-4">
                    <code className="font-mono text-sm font-semibold text-mathe-blue">#{r.id}</code>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <VakBadge style={toDisplayStyle(r.predominantStyle)} />
                      {r.secondaryStyle && (
                        <span className="text-xs text-mathe-muted">
                          2°: {toDisplayStyle(r.secondaryStyle)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-bold tabular-nums text-mathe-ink">
                      {r.predominantConfidence.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-mathe-muted">
                    {CLASSIFIER_LABEL[r.classifierType] ?? r.classifierType}
                  </td>
                  <td className="px-5 py-4 text-sm text-mathe-muted">
                    {formatDate(r.createdAt)}
                  </td>
                </tr>
              ))}
            </motion.tbody>
          </table>
        )}
      </motion.div>

      {/* ── Pagination ── */}
      {!loading && total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-mathe-muted">
            Página <span className="font-semibold text-mathe-ink">{page}</span> de{" "}
            <span className="font-semibold text-mathe-ink">{totalPages}</span>
            {" "}· <span className="font-semibold text-mathe-ink">{total}</span> resultados
          </p>
          <Pagination page={page} total={totalPages} onChange={setPage} />
        </div>
      )}

      {/* ── AI Feedback note ── */}
      {!loading && results.some((r) => r.aiFeedback) && (
        <motion.div
          variants={fadeUp}
          className="flex items-start gap-3 rounded-xl border border-mathe-border bg-mathe-surface px-5 py-4"
        >
          <Bot className="mt-0.5 size-4 shrink-0 text-mathe-muted" />
          <p className="text-sm text-mathe-muted">
            Algunos resultados incluyen retroalimentación generada por Gemini AI.
            Consulta el detalle del resultado individual para leerla.
          </p>
        </motion.div>
      )}

    </motion.div>
  )
}
