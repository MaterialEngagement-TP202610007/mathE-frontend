import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChartPie,
  CheckCircle2,
  ClipboardList,
  Eye,
  Loader2,
  PlayCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { motion } from "motion/react"
import { ROLE, ROUTING } from "@/config/constant.config"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { useQuizIntroStore } from "@/features/quiz/store/quiz-intro.store"
import { useQuizStore } from "@/features/quiz/store/quiz.store"
import { useQuizStatusStore } from "@/features/quiz/store/quiz-status.store"
import { questionnaireService } from "@/features/quiz/services/questionnaire.service"
import { resultService } from "@/features/results/services/result.service"
import { toDisplayStyle, VAK_COLORS } from "@/features/results/utils/vak"
import { ACADEMIC_GRADES } from "@/data/academic-grades"
import { cn } from "@/lib/utils"
import { Avatar } from "../components/Avatar"
import { PlaceholderPage } from "../components/PlaceholderPage"
import { VakBadge, type VakStyle } from "../components/VakBadge"
import type { QuizResult } from "@/features/results/interfaces/result.interface"

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return "Hoy"
  if (days === 1) return "Ayer"
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem.`
  return `Hace ${Math.floor(days / 30)} mes.`
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-mathe-border/60", className)} />
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  hint,
  icon,
  accent,
  loading,
  className,
}: {
  label: string
  value: string
  hint: string
  icon: React.ReactNode
  accent?: boolean
  loading?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-mathe-muted">{label}</p>
        <span className="grid size-8 place-items-center rounded-xl bg-mathe-surface text-mathe-muted">
          {icon}
        </span>
      </div>
      {loading ? (
        <>
          <Skeleton className="mb-2 h-9 w-24" />
          <Skeleton className="h-4 w-32" />
        </>
      ) : (
        <>
          <p className={cn("text-3xl font-bold", accent ? "text-mathe-blue" : "text-mathe-ink")}>
            {value}
          </p>
          <p className="mt-2 text-sm text-mathe-muted">{hint}</p>
        </>
      )}
    </div>
  )
}

// ── VAK probability mini-bar ──────────────────────────────────────────────────

function VakMiniBar({ v, a, k }: { v: number; a: number; k: number }) {
  return (
    <div className="flex h-1.5 w-24 overflow-hidden rounded-full">
      <div className="bg-mathe-blue" style={{ width: `${v}%` }} />
      <div className="bg-emerald-500" style={{ width: `${a}%` }} />
      <div className="bg-amber-500" style={{ width: `${k}%` }} />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
}

export function DashboardHome() {
  const user = useAuthStore((s) => s.user)
  const roleId = useAuthStore((s) => s.roleId)
  const openQuizIntro = useQuizIntroStore((s) => s.open)
  const quizSession = useQuizStore((s) => s.session)
  const navigate = useNavigate()

  const availability = useQuizStatusStore((s) => s.availability)
  const setAvailability = useQuizStatusStore((s) => s.setAvailability)
  const startSession = useQuizStore((s) => s.startSession)

  const [results, setResults] = useState<QuizResult[]>([])
  const [loadingResults, setLoadingResults] = useState(true)

  useEffect(() => {
    if (roleId !== ROLE.STUDENT) return

    if (quizSession) {
      setAvailability("has_local")
    } else {
      setAvailability("checking")
      questionnaireService
        .getActive()
        .then((active) => {
          // Hydrate the quiz store so the session is available when the user navigates.
          startSession(active)
          setAvailability("has_remote")
        })
        .catch(() => setAvailability("available"))
    }

    resultService
      .getMy({ page: 1, limit: 5 })
      .then((res) => setResults(res.items))
      .catch(() => setResults([]))
      .finally(() => setLoadingResults(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId])

  if (roleId === ROLE.TEACHER) {
    return (
      <PlaceholderPage
        title={`Hola, ${user?.name ?? "profesor"}`}
        description="Desde aquí podrás generar y validar preguntas y revisar a tus estudiantes."
      />
    )
  }

  const name = user?.name ?? "Estudiante"
  const grade = ACADEMIC_GRADES.find((g) => g.id === user?.academicGradeId)
  const latest = results[0] ?? null
  const answeredCount = Object.keys(quizSession?.answers ?? {}).length
  const totalQuestions = quizSession?.questions.length ?? 10

  return (
    <motion.div className="grid gap-8" initial="hidden" animate="show" variants={stagger}>

      {/* ── Top grid ── */}
      <div className="grid gap-6 laptop:grid-cols-4">

        {/* Welcome card */}
        <motion.section
          variants={fadeUp}
          className="flex flex-col gap-6 rounded-2xl bg-mathe-blue p-8 text-mathe-white laptop:col-span-2 laptop:row-span-2"
        >
          <Avatar name={name} className="bg-mathe-white/15 text-lg text-mathe-white" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-mathe-white/70">
              Bienvenida de vuelta
            </p>
            <h1 className="mt-1 text-3xl font-bold">{name}</h1>
            <p className="mt-2 text-mathe-white/80">Colegio Claretiano</p>
            {grade && <p className="text-mathe-white/80">{grade.name}</p>}
          </div>

          <div className="h-px bg-mathe-white/20" />

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-mathe-white/70">
                Estilo predominante
              </p>
              {loadingResults ? (
                <div className="mt-2 h-7 w-28 animate-pulse rounded-pill bg-mathe-white/20" />
              ) : latest ? (
                <span className="mt-2 inline-flex items-center gap-2 rounded-pill bg-mathe-white/15 px-3 py-1.5 text-sm font-semibold">
                  <Eye className="size-4" />
                  {toDisplayStyle(latest.predominantStyle)}
                </span>
              ) : (
                <span className="mt-2 inline-flex items-center gap-2 rounded-pill bg-mathe-white/10 px-3 py-1.5 text-sm text-mathe-white/60">
                  Sin datos aún
                </span>
              )}
            </div>

            {availability === "has_local" || availability === "has_remote" ? (
              <button
                type="button"
                onClick={() => navigate(ROUTING.QUIZ)}
                className="inline-flex h-12 items-center gap-2 rounded-pill bg-mathe-white px-6 text-sm font-semibold text-mathe-blue transition-colors hover:bg-mathe-surface"
              >
                <PlayCircle className="size-4" />
                <span>
                  Continuar cuestionario
                  {availability === "has_local" && (
                    <span className="ml-1.5 rounded-full bg-mathe-blue/10 px-1.5 py-0.5 text-xs">
                      {answeredCount}/{totalQuestions}
                    </span>
                  )}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={availability === "available" ? openQuizIntro : undefined}
                disabled={availability !== "available"}
                className="inline-flex h-12 items-center gap-2 rounded-pill bg-mathe-white px-6 text-sm font-semibold text-mathe-blue transition-colors hover:bg-mathe-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                {availability === "checking" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ClipboardList className="size-4" />
                )}
                Iniciar cuestionario
              </button>
            )}
          </div>
        </motion.section>

        {/* Stat cards */}
        <motion.div variants={fadeUp}>
          <StatCard
            label="Último estilo"
            value={latest ? toDisplayStyle(latest.predominantStyle) : "—"}
            hint={latest ? `${latest.predominantConfidence}% confianza` : "Sin evaluaciones"}
            icon={<Sparkles className="size-4" />}
            accent
            loading={loadingResults}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <StatCard
            label="Última evaluación"
            value={latest ? formatDate(latest.createdAt).split(" ").slice(0, 2).join(" ") : "—"}
            hint={latest ? formatRelative(latest.createdAt) : "Sin evaluaciones"}
            icon={<Calendar className="size-4" />}
            loading={loadingResults}
          />
        </motion.div>

        <motion.div variants={fadeUp} className="laptop:col-span-2">
          <StatCard
            label="Cuestionarios realizados"
            value={loadingResults ? "—" : String(results.length === 5 ? "5+" : results.length)}
            hint={results.length > 0 ? `Desde ${formatDate(results[results.length - 1]?.createdAt ?? "")}` : "Completa tu primer cuestionario"}
            icon={<TrendingUp className="size-4" />}
            accent
            loading={loadingResults}
            className="h-full"
          />
        </motion.div>
      </div>

      {/* ── Active quiz banner ── */}
      {(availability === "has_local" || availability === "has_remote") && (
        <motion.div variants={fadeUp}>
          <button
            type="button"
            onClick={() => navigate(ROUTING.QUIZ)}
            className="flex w-full items-center gap-4 rounded-2xl border border-mathe-blue/20 bg-blue-50 px-6 py-4 text-left transition-colors hover:bg-blue-100"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mathe-blue text-mathe-white">
              <PlayCircle className="size-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-mathe-ink">
                Tienes un cuestionario en progreso
              </p>
              <p className="text-xs text-mathe-muted">
                {availability === "has_local"
                  ? `${answeredCount} de ${totalQuestions} preguntas respondidas — haz clic para continuar`
                  : "Recuperado desde el servidor — haz clic para continuar"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {availability === "has_local" && (
                <div className="h-2 w-24 overflow-hidden rounded-full bg-mathe-border">
                  <div
                    className="h-full rounded-full bg-mathe-blue transition-all"
                    style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                  />
                </div>
              )}
              <ArrowRight className="size-4 shrink-0 text-mathe-blue" />
            </div>
          </button>
        </motion.div>
      )}

      {/* ── Recent results ── */}
      <motion.section variants={fadeUp} className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-mathe-ink">
            <ChartPie className="size-5 text-mathe-muted" />
            Resultados recientes
          </h2>
          {results.length > 0 && (
            <button
              type="button"
              onClick={() => navigate(ROUTING.DASHBOARD_HISTORY)}
              className="text-sm font-semibold text-mathe-blue hover:underline"
            >
              Ver historial
            </button>
          )}
        </div>

        {loadingResults ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-mathe-border bg-mathe-white px-5 py-4"
              >
                <Skeleton className="size-9 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-6 w-16 rounded-pill" />
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-mathe-border bg-mathe-surface py-12 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-mathe-white shadow-sm">
              <BookOpen className="size-7 text-mathe-muted" />
            </span>
            <div>
              <p className="font-semibold text-mathe-ink">Aún no tienes resultados</p>
              <p className="mt-1 text-sm text-mathe-muted">
                Completa tu primer cuestionario para ver tu estilo de aprendizaje
              </p>
            </div>
            <button
              type="button"
              onClick={openQuizIntro}
              className="inline-flex h-10 items-center gap-2 rounded-pill border border-mathe-border bg-mathe-white px-5 text-sm font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface hover:text-mathe-blue"
            >
              <ClipboardList className="size-4" />
              Iniciar cuestionario
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {results.map((r, idx) => {
              const display = toDisplayStyle(r.predominantStyle)
              const { text } = VAK_COLORS[r.predominantStyle]
              return (
                <motion.button
                  key={r.id}
                  type="button"
                  onClick={() => navigate(`/dashboard/resultados/${r.id}`)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 30 }}
                  className="flex w-full flex-wrap items-center gap-4 rounded-2xl border border-mathe-border bg-mathe-white px-5 py-4 shadow-sm transition-colors hover:border-mathe-blue/30 hover:bg-blue-50/30 hover:shadow-md"
                >
                  {/* Icon */}
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-xl",
                      idx === 0 ? "bg-mathe-blue text-mathe-white" : "bg-mathe-surface text-mathe-muted",
                    )}
                  >
                    {idx === 0 ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <Calendar className="size-4" />
                    )}
                  </span>

                  {/* Date */}
                  <div className="min-w-[7rem] text-left">
                    <p className="text-sm font-semibold text-mathe-ink">{formatDate(r.createdAt)}</p>
                    <p className="text-xs text-mathe-muted">{formatRelative(r.createdAt)}</p>
                  </div>

                  {/* Badge */}
                  <VakBadge style={display as VakStyle} />

                  {/* Confidence */}
                  <span className={cn("text-sm font-bold tabular-nums", text)}>
                    {r.predominantConfidence}%
                  </span>

                  {/* Mini VAK bar */}
                  <div className="hidden items-center gap-2 tablet:flex">
                    <VakMiniBar
                      v={r.visualProbability}
                      a={r.auditoryProbability}
                      k={r.kinestheticProbability}
                    />
                    <span className="text-xs text-mathe-muted">
                      V{r.visualProbability} A{r.auditoryProbability} K{r.kinestheticProbability}
                    </span>
                  </div>

                  <ArrowRight className="ml-auto size-4 shrink-0 text-mathe-muted" />
                </motion.button>
              )
            })}
          </div>
        )}
      </motion.section>

    </motion.div>
  )
}
