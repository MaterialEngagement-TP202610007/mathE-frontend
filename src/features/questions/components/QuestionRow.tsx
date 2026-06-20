import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { VakBadge } from "@/features/dashboard/components/VakBadge"
import { toSpanishStyle, formatQuestionId, formatDate } from "@/features/dashboard/utils"
import type { Question, QuestionStatus } from "../interfaces/question.interface"

// ── Status badge (for validation history) ─────────────────────────────────────

const STATUS_STYLES: Record<QuestionStatus, string> = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
}

const STATUS_LABELS: Record<QuestionStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
}

function StatusBadge({ status }: { status: QuestionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

// ── Props ──────────────────────────────────────────────────────────────────────

export interface QuestionRowProps {
  question: Question
  /** Button label. Default: "Revisar" */
  actionLabel?: string
  /** Called when the action button is clicked. Omit to hide the button. */
  onAction?: (question: Question) => void
  /** Show a status badge (approved / rejected / pending) — useful in history views. */
  showStatus?: boolean
  /** Stagger animation delay in seconds */
  animationDelay?: number
  className?: string
}

// ── Component ──────────────────────────────────────────────────────────────────

export function QuestionRow({
  question,
  actionLabel = "Revisar",
  onAction,
  showStatus = false,
  animationDelay = 0,
  className,
}: QuestionRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay, type: "spring", stiffness: 300, damping: 30 }}
      className={cn("flex items-center gap-3 px-5 py-4", className)}
    >
      {/* Code chip */}
      <code className="shrink-0 rounded-lg bg-mathe-surface px-2 py-1 font-mono text-[11px] font-semibold text-mathe-muted">
        {formatQuestionId(question.id)}
      </code>

      {/* VAK badge */}
      <VakBadge style={toSpanishStyle(question.vakStyle)} className="shrink-0" />

      {/* Status badge (validation history) */}
      {showStatus && <StatusBadge status={question.validationStatus} />}

      {/* Statement */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-mathe-ink max-w-[calc(100%-100px)]">{question.statement}</p>
        <p className="mt-0.5 text-xs text-mathe-muted">{formatDate(question.createdAt)}</p>
      </div>

      {/* Action button */}
      {onAction && (
        <button
          type="button"
          onClick={() => onAction(question)}
          className="inline-flex h-9 shrink-0 items-center rounded-pill bg-mathe-blue px-4 text-xs font-semibold text-mathe-white transition-colors hover:bg-mathe-blue/90"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  )
}
