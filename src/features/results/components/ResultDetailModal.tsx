import { motion, AnimatePresence } from "motion/react"
import { Bot, Brain, X } from "lucide-react"
import { VakBadge } from "@/features/dashboard/components/VakBadge"
import { toDisplayStyle } from "../utils/vak"
import type { QuizResult } from "../interfaces/result.interface"
import type { User } from "@/features/users/interfaces/user.interface"

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric", month: "long", year: "numeric",
  })
}

function ProbBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-mathe-muted">{label}</span>
        <span className="font-semibold tabular-nums text-mathe-ink">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-mathe-border/40">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        />
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="text-mathe-muted">{label}</span>
      <span className="font-medium text-mathe-ink">{value}</span>
    </div>
  )
}

const CLASSIFIER_LABEL: Record<string, string> = {
  xgboost:      "XGBoost (ML)",
  simple_score: "Score simple",
}

const PROFILE_LABEL: Record<string, string> = {
  clear:     "Claro",
  tendency:  "Tendencia",
  mixed:     "Mixto",
  dominant:  "Dominante",
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
  result: QuizResult | null
  student: User | null
}

export function ResultDetailModal({ open, onClose, result, student }: Props) {
  if (!result) return null

  const displayStyle = toDisplayStyle(result.predominantStyle)
  const initials = student ? getInitials(student.name) : "?"

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bd"
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-mathe-border bg-mathe-white shadow-2xl">

              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-xl bg-mathe-surface text-mathe-muted transition-colors hover:bg-mathe-border/60"
              >
                <X className="size-4" />
              </button>

              {/* Header */}
              <div className="border-b border-mathe-border px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-full bg-mathe-blue/10 text-sm font-bold text-mathe-blue">
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-mathe-ink">{student?.name ?? `Estudiante #${result.studentId}`}</p>
                    <p className="text-xs text-mathe-muted">{formatDate(result.createdAt)}</p>
                  </div>
                  <div className="ml-auto pr-8">
                    <VakBadge style={displayStyle} />
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="grid gap-5 px-6 py-5">

                {/* Probabilities */}
                <div className="grid gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                    Distribución de estilos
                  </p>
                  <ProbBar label="Visual"      value={result.visualProbability}      color="#0056D2" />
                  <ProbBar label="Auditivo"    value={result.auditoryProbability}    color="#2a9d6f" />
                  <ProbBar label="Kinestésico" value={result.kinestheticProbability} color="#c4922a" />
                </div>

                {/* Metadata */}
                <div className="divide-y divide-mathe-border/60 rounded-xl bg-mathe-surface px-4">
                  <InfoRow label="Confianza predominante" value={`${result.predominantConfidence.toFixed(1)}%`} />
                  <InfoRow label="Tipo de perfil"         value={PROFILE_LABEL[result.profileType] ?? result.profileType} />
                  <InfoRow label="Clasificador"           value={CLASSIFIER_LABEL[result.classifierType] ?? result.classifierType} />
                  {result.secondaryStyle && (
                    <InfoRow
                      label="Estilo secundario"
                      value={<VakBadge style={toDisplayStyle(result.secondaryStyle)} className="text-xs" />}
                    />
                  )}
                </div>

                {/* AI feedback */}
                {result.aiFeedback && (
                  <div className="rounded-xl border border-mathe-border bg-blue-50/50 p-4">
                    <div className="mb-2 flex items-center gap-1.5">
                      <Bot className="size-3.5 text-mathe-muted" />
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-mathe-muted">
                        Retroalimentación IA
                      </p>
                    </div>
                    <p className="text-xs leading-relaxed text-mathe-ink line-clamp-5">
                      {result.aiFeedback}
                    </p>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="border-t border-mathe-border px-6 py-4 flex items-center gap-2">
                <Brain className="size-3.5 text-mathe-muted/60" />
                <p className="text-xs text-mathe-muted">
                  Cuestionario #{result.questionnaireId} · Resultado #{result.id}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
