import { useEffect, useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router"
import { ArrowRight, Bot, LayoutDashboard } from "lucide-react"
import { motion } from "motion/react"
import { MatheLogo } from "@/shared/components/icons/MatheLogo"
import { VakBadge } from "@/features/dashboard/components/VakBadge"
import { ConfettiCelebration } from "../components/ConfettiCelebration"
import { StyleDistribution } from "../components/StyleDistribution"
import { resultService } from "../services/result.service"
import { toDisplayStyle } from "../utils/vak"
import type { QuizResult } from "../interfaces/result.interface"

const STYLE_ICON_CLASS: Record<string, string> = {
  Visual: "bg-mathe-blue/10 text-mathe-blue",
  Auditory: "bg-emerald-50 text-emerald-600",
  Kinesthetic: "bg-amber-50 text-amber-600",
}

const STYLE_SVG: Record<string, React.ReactNode> = {
  Visual: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-9">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Auditory: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-9">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),
  Kinesthetic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-9">
      <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
      <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5a2 2 0 0 0-2-2a2 2 0 0 0-2 2V18a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6v-8a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
    </svg>
  ),
}

interface LocationState {
  result?: QuizResult
}

export function ResultPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const stateResult = (location.state as LocationState | null)?.result
  const [result, setResult] = useState<QuizResult | null>(stateResult ?? null)
  const [loading, setLoading] = useState(!stateResult)

  useEffect(() => {
    if (stateResult) return
    resultService
      .getById(Number(id))
      .then(setResult)
      .catch(() => navigate("/dashboard", { replace: true }))
      .finally(() => setLoading(false))
  }, [id, stateResult, navigate])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-mathe-surface">
        <div className="size-9 animate-spin rounded-full border-4 border-mathe-border border-t-mathe-blue" />
      </div>
    )
  }

  if (!result) return null

  const displayStyle = toDisplayStyle(result.predominantStyle)
  const iconClass = STYLE_ICON_CLASS[result.predominantStyle]
  const svgIcon = STYLE_SVG[result.predominantStyle]
  const detailUrl = `/dashboard/resultados/${result.id}`

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  }
  const card = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 28 } },
  }

  return (
    <div className="flex min-h-svh flex-col bg-mathe-surface">
      <ConfettiCelebration />

      <header className="flex h-20 shrink-0 items-center px-6 tablet:px-10">
        <MatheLogo width={108} height={48} />
      </header>

      <main className="flex flex-1 justify-center px-6 pb-16 pt-4">
        <motion.div
          className="flex w-full max-w-xl flex-col gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* ── Hero ── */}
          <motion.div
            variants={card}
            className="flex flex-col items-center gap-4 rounded-2xl border border-mathe-border bg-mathe-white p-8 text-center shadow-sm"
          >
            <span className={`grid size-20 place-items-center rounded-full ${iconClass}`}>
              {svgIcon}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-mathe-muted">
                Tu estilo de aprendizaje predominante es
              </p>
              <h1 className="mt-2 text-5xl font-bold text-mathe-ink">{displayStyle}</h1>
            </div>
            <VakBadge style={displayStyle} className="mt-1 text-sm px-3 py-1.5" />
          </motion.div>

          {/* ── Distribution ── */}
          <motion.div variants={card}>
            <StyleDistribution result={result} />
          </motion.div>

          {/* ── AI Feedback ── */}
          {result.aiFeedback && (
            <motion.div
              variants={card}
              className="rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-mathe-muted">
                  Descripción generada por inteligencia artificial
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-mathe-muted">
                  <Bot className="size-3.5" />
                  Generado por IA
                </span>
              </div>
              <p className="text-sm leading-relaxed text-mathe-ink">{result.aiFeedback}</p>
            </motion.div>
          )}

          {/* ── Mixed profile ── */}
          {result.isMixedProfile && result.secondaryStyle && (
            <motion.div
              variants={card}
              className="rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-mathe-muted">
                Perfil mixto
              </p>
              <p className="mt-2 text-sm text-mathe-muted">
                Tu perfil presenta componentes secundarios relevantes:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <VakBadge style={displayStyle} />
                <VakBadge style={toDisplayStyle(result.secondaryStyle)} />
              </div>
            </motion.div>
          )}

          {/* ── CTAs ── */}
          <motion.div
            variants={card}
            className="flex flex-col-reverse gap-3 pt-2 tablet:flex-row"
          >
            <button
              type="button"
              onClick={() => navigate("/dashboard", { replace: true })}
              className="flex-1 inline-flex h-13 items-center justify-center rounded-pill border border-mathe-border bg-mathe-white px-6 text-sm font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface"
            >
              <LayoutDashboard className="mr-2 size-4" />
              Volver al dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate(detailUrl)}
              className="flex-1 inline-flex h-13 items-center justify-center gap-2 rounded-pill bg-mathe-blue px-6 text-sm font-semibold text-mathe-white transition-colors hover:bg-mathe-blue-deep"
            >
              Ver informe detallado
              <ArrowRight className="size-4" />
            </button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
