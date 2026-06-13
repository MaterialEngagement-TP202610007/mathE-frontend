import { ArrowRight, Calendar, ClipboardList, Eye } from "lucide-react"
import { ROLE } from "@/config/constant.config"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { useQuizIntroStore } from "@/features/quiz/store/quiz-intro.store"
import { ACADEMIC_GRADES } from "@/data/academic-grades"
import { cn } from "@/lib/utils"
import { Avatar } from "../components/Avatar"
import { PlaceholderPage } from "../components/PlaceholderPage"
import { VakBadge, type VakStyle } from "../components/VakBadge"

// Placeholder data — wire to the results endpoint when available.
interface ResultRow {
  id: number
  date: string
  style: VakStyle
  v: number
  a: number
  k: number
}

const RECENT_RESULTS: ResultRow[] = [
  { id: 1, date: "18 abr 2026", style: "Visual", v: 72, a: 18, k: 10 },
  { id: 2, date: "02 mar 2026", style: "Visual", v: 68, a: 22, k: 10 },
  { id: 3, date: "14 ene 2026", style: "Auditivo", v: 35, a: 48, k: 17 },
]

function StatCard({
  label,
  value,
  hint,
  accent,
  className,
}: {
  label: string
  value: string
  hint: string
  accent?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-mathe-muted">
        {label}
      </p>
      <p
        className={cn(
          "mt-3 text-3xl font-bold",
          accent ? "text-mathe-blue" : "text-mathe-ink",
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-sm text-mathe-muted">{hint}</p>
    </div>
  )
}

export function DashboardHome() {
  const user = useAuthStore((s) => s.user)
  const roleId = useAuthStore((s) => s.roleId)
  const openQuizIntro = useQuizIntroStore((s) => s.open)

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

  return (
    <div className="grid gap-8">
      <div className="grid gap-6 laptop:grid-cols-4">
        {/* Welcome card */}
        <section className="flex flex-col gap-6 rounded-2xl bg-mathe-blue p-8 text-mathe-white laptop:col-span-2 laptop:row-span-2">
          <Avatar
            name={name}
            className="bg-mathe-white/15 text-lg text-mathe-white"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-mathe-white/70">
              Bienvenida de vuelta
            </p>
            <h1 className="mt-1 text-3xl font-bold">{name}</h1>
            <p className="mt-2 text-mathe-white/80">Colegio Claretiano</p>
            {grade && (
              <p className="text-mathe-white/80">{grade.name}</p>
            )}
          </div>

          <div className="h-px bg-mathe-white/20" />

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-mathe-white/70">
                Estilo predominante
              </p>
              <span className="mt-2 inline-flex items-center gap-2 rounded-pill bg-mathe-white/15 px-3 py-1.5 text-sm font-semibold">
                <Eye className="size-4" /> Visual
              </span>
            </div>
            <button
              type="button"
              onClick={openQuizIntro}
              className="inline-flex h-12 items-center gap-2 rounded-pill bg-mathe-white px-6 text-sm font-semibold text-mathe-blue transition-colors hover:bg-mathe-surface"
            >
              <ClipboardList className="size-4" />
              Iniciar cuestionario
            </button>
          </div>
        </section>

        <StatCard
          label="Último estilo predominante"
          value="Visual"
          hint="72% de confianza"
          accent
        />
        <StatCard
          label="Última evaluación"
          value="18 abr"
          hint="Hace 7 días"
        />
        <StatCard
          label="Cuestionarios realizados"
          value="3"
          hint="Desde enero 2026"
          accent
          className="laptop:col-span-2"
        />
      </div>

      {/* Recent results */}
      <section className="grid gap-4">
        <h2 className="text-lg font-bold text-mathe-ink">Resultados recientes</h2>
        <div className="grid gap-3">
          {RECENT_RESULTS.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-mathe-border bg-mathe-white px-5 py-4 shadow-sm"
            >
              <Calendar className="size-4 text-mathe-muted" />
              <span className="text-sm font-medium text-mathe-ink">
                {r.date}
              </span>
              <VakBadge style={r.style} />
              <span className="text-sm font-semibold text-mathe-blue">
                V {r.v}%
              </span>
              <span className="text-sm font-semibold text-emerald-600">
                A {r.a}%
              </span>
              <span className="text-sm font-semibold text-amber-600">
                K {r.k}%
              </span>
              <button
                type="button"
                className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-mathe-blue hover:underline"
              >
                Ver <ArrowRight className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
