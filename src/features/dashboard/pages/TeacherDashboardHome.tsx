import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { ArrowRight, CheckCircle2, ClipboardList, Clock, Sparkles, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { toast } from "sonner"
import { ROUTING } from "@/config/constant.config"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { questionService } from "@/features/questions/services/question.service"
import { QuestionRow } from "@/features/questions/components/QuestionRow"
import { GenerateQuestionsModal } from "@/features/questions/components/GenerateQuestionsModal"
import { GeneratingOverlay } from "@/features/questions/components/GeneratingOverlay"
import type { Question, VakStyleApi } from "@/features/questions/interfaces/question.interface"
import { isThisMonth } from "../utils"
import { cn } from "@/lib/utils"

// ── Helpers ───────────────────────────────────────────────────────────────────

function currentMonthLabel() {
  const s = new Date().toLocaleDateString("es-PE", { month: "long", year: "numeric" })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-mathe-border/60", className)} />
}

function StatCard({
  label,
  value,
  hint,
  valueColor,
  iconBg,
  icon,
  loading,
}: {
  label: string
  value: string | number
  hint: string
  valueColor: string
  iconBg: string
  icon: React.ReactNode
  loading?: boolean
}) {
  return (
    <div className="rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest self-center text-mathe-muted">
          {label}
        </p>
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", iconBg)}>
          {icon}
        </span>
      </div>
      {loading ? (
        <>
          <Skeleton className="mb-2 h-10 w-16" />
          <Skeleton className="h-4 w-28" />
        </>
      ) : (
        <>
          <p className={cn("text-4xl font-bold tabular-nums", valueColor)}>{value}</p>
          <p className="mt-2 text-sm text-mathe-muted">{hint}</p>
        </>
      )}
    </div>
  )
}

// ── Animations ────────────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function TeacherDashboardHome() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const [pendingQuestions, setPendingQuestions] = useState<Question[]>([])
  const [pendingTotal, setPendingTotal] = useState(0)
  const [approvedThisMonth, setApprovedThisMonth] = useState(0)
  const [rejectedThisMonth, setRejectedThisMonth] = useState(0)
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [justGenerated, setJustGenerated] = useState(false)

  useEffect(() => {
    Promise.all([
      questionService.listMy({ status: "pending", page: 1, limit: 5 }),
      questionService.listMy({ status: "approved", page: 1, limit: 50 }),
      questionService.listMy({ status: "rejected", page: 1, limit: 50 }),
    ])
      .then(([p, a, r]) => {
        setPendingQuestions(p.items)
        setPendingTotal(p.total)
        setApprovedThisMonth(a.items.filter((q) => isThisMonth(q.updatedAt)).length)
        setRejectedThisMonth(r.items.filter((q) => isThisMonth(q.updatedAt)).length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleGenerate(count: number, vakStyle: VakStyleApi) {
    setGenerating(true)
    try {
      await questionService.generateBatch({ count, vakStyle, teacherId: user?.id })
      toast.success(`${count} preguntas generadas. ¡Revísalas ahora!`)
      const [p, a, r] = await Promise.all([
        questionService.listMy({ status: "pending", page: 1, limit: 5 }),
        questionService.listMy({ status: "approved", page: 1, limit: 50 }),
        questionService.listMy({ status: "rejected", page: 1, limit: 50 }),
      ])
      setPendingQuestions(p.items)
      setPendingTotal(p.total)
      setApprovedThisMonth(a.items.filter((q) => isThisMonth(q.updatedAt)).length)
      setRejectedThisMonth(r.items.filter((q) => isThisMonth(q.updatedAt)).length)
      setJustGenerated(true)
    } catch {
      toast.error("Error al generar las preguntas. Intenta de nuevo.")
    } finally {
      setGenerating(false)
    }
  }

  const firstName = user?.name?.split(" ")[0] ?? "Profesor"
  const monthLabel = currentMonthLabel()

  return (
    <motion.div className="grid gap-8" initial="hidden" animate="show" variants={stagger}>

      {/* ── Header ── */}
      <motion.div variants={fadeUp}>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
          Panel del Profesor
        </p>
        <h1 className="mt-1 text-3xl font-bold text-mathe-ink">
          Bienvenido, Prof. {firstName}
        </h1>
      </motion.div>

      {/* ── Stat cards ── */}
      <motion.div variants={fadeUp} className="grid gap-4 tablet:grid-cols-3">
        <StatCard
          label="Preguntas pendientes"
          value={pendingTotal}
          hint="Requieren revisión"
          valueColor="text-amber-500"
          iconBg="bg-amber-50 text-amber-500"
          icon={<Clock className="size-4" />}
          loading={loading}
        />
        <StatCard
          label="Aprobadas este mes"
          value={approvedThisMonth}
          hint={monthLabel}
          valueColor="text-emerald-600"
          iconBg="bg-emerald-50 text-emerald-600"
          icon={<CheckCircle2 className="size-4" />}
          loading={loading}
        />
        <StatCard
          label="Rechazadas este mes"
          value={rejectedThisMonth}
          hint={monthLabel}
          valueColor="text-red-500"
          iconBg="bg-red-50 text-red-500"
          icon={<XCircle className="size-4" />}
          loading={loading}
        />
      </motion.div>

      {/* ── Recent pending questions ── */}
      <motion.section variants={fadeUp} className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-mathe-ink">Preguntas pendientes recientes</h2>
          {pendingTotal > 0 && (
            <button
              type="button"
              onClick={() => navigate(ROUTING.DASHBOARD_QUESTIONS)}
              className="text-sm font-semibold text-mathe-blue hover:underline"
            >
              Ver todas →
            </button>
          )}
        </div>

        {loading ? (
          <div className="overflow-hidden rounded-2xl border border-mathe-border bg-mathe-white shadow-sm">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 px-5 py-4",
                  i !== 3 && "border-b border-mathe-border",
                )}
              >
                <Skeleton className="h-6 w-16 rounded-lg" />
                <Skeleton className="h-6 w-20 rounded-pill" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-9 w-20 rounded-pill" />
              </div>
            ))}
          </div>
        ) : pendingQuestions.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-mathe-border bg-mathe-surface py-12 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-mathe-white shadow-sm">
              <ClipboardList className="size-7 text-mathe-muted" />
            </span>
            <div>
              <p className="font-semibold text-mathe-ink">No hay preguntas pendientes</p>
              <p className="mt-1 text-sm text-mathe-muted">
                Genera nuevas preguntas con IA para comenzar a revisar
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex h-11 items-center gap-2 rounded-pill bg-mathe-blue px-6 text-sm font-semibold text-mathe-white transition-colors hover:bg-mathe-blue/90"
            >
              <Sparkles className="size-4" />
              Generar preguntas
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-mathe-border bg-mathe-white shadow-sm">
            {pendingQuestions.map((q, idx) => (
              <QuestionRow
                key={q.id}
                question={q}
                onAction={() => navigate(ROUTING.DASHBOARD_QUESTIONS)}
                animationDelay={idx * 0.05}
                className={idx !== pendingQuestions.length - 1 ? "border-b border-mathe-border" : undefined}
              />
            ))}
          </div>
        )}
      </motion.section>

      {/* ── Post-generation CTA ── */}
      <AnimatePresence>
        {justGenerated && (
          <motion.div
            key="generated-cta"
            className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 shadow-sm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-100">
                <Sparkles className="size-4 text-emerald-600" />
              </span>
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Preguntas generadas exitosamente
                </p>
                <p className="text-xs text-emerald-600">
                  Revisa y valida cada pregunta antes de que se active para los estudiantes.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(ROUTING.DASHBOARD_QUESTIONS)}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-pill bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Ver preguntas
              <ArrowRight className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <GenerateQuestionsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onGenerate={handleGenerate}
      />
      <GeneratingOverlay visible={generating} />

    </motion.div>
  )
}
