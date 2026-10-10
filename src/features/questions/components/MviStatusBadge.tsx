import { AlertTriangle, CircleDashed, CloudOff, ShieldAlert, ShieldCheck } from "lucide-react"
import type { ComponentType } from "react"
import { cn } from "@/lib/utils"
import type { MviStatus } from "../interfaces/question.interface"

type BadgeKey = MviStatus | "none"

const STATUSES: Record<
  BadgeKey,
  { label: string; icon: ComponentType<{ className?: string }>; className: string }
> = {
  passed: {
    label: "Aprobada por el motor",
    icon: ShieldCheck,
    className: "bg-emerald-50 text-mathe-success",
  },
  failed: {
    label: "Con observaciones del motor",
    icon: ShieldAlert,
    className: "bg-amber-50 text-amber-700",
  },
  unavailable: {
    label: "Motor no disponible",
    icon: CloudOff,
    className: "bg-mathe-surface text-mathe-muted",
  },
  skipped: {
    label: "Sin validar",
    icon: CircleDashed,
    className: "bg-mathe-surface text-mathe-muted",
  },
  none: {
    label: "Sin validar",
    icon: CircleDashed,
    className: "bg-mathe-surface text-mathe-muted",
  },
}

interface MviStatusBadgeProps {
  status: MviStatus | null | undefined
  /** "sm" is a compact variant for list rows; the default rendering is unchanged. */
  size?: "default" | "sm"
  className?: string
}

/** Pill badge for the MVI (validation engine) diagnosis of a question. */
export function MviStatusBadge({ status, size = "default", className }: MviStatusBadgeProps) {
  const key: BadgeKey = status && status in STATUSES ? status : "none"
  const { label, icon: Icon, className: tone } = STATUSES[key]
  const compact = size === "sm"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill font-semibold",
        compact ? "gap-1 px-2 py-0.5 text-[11px]" : "gap-1.5 px-2.5 py-1 text-xs",
        tone,
        className,
      )}
    >
      <Icon className={cn("shrink-0", compact ? "size-3" : "size-3.5")} />
      {label}
    </span>
  )
}

/** Compact marker for a question a teacher approved while the MVI diagnosis had failed. */
export function ApprovedOverMviMarker({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200",
        className,
      )}
    >
      <AlertTriangle className="size-3 shrink-0" aria-hidden="true" />
      Aprobada sobre MVI
    </span>
  )
}

interface MviRowMarkersProps {
  mviStatus: MviStatus | null | undefined
  approvedOverMvi: boolean | undefined
  className?: string
}

/**
 * MVI markers for list rows (HU-58/60). The status badge renders only when the question
 * carries an `mviStatus`, so older questions validated before the engine existed stay clean
 * instead of showing "Sin validar" on every row. Renders nothing when there is nothing to show.
 */
export function MviRowMarkers({ mviStatus, approvedOverMvi, className }: MviRowMarkersProps) {
  const hasStatus = mviStatus !== null && mviStatus !== undefined
  if (!hasStatus && !approvedOverMvi) return null
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      {hasStatus && <MviStatusBadge status={mviStatus} size="sm" />}
      {approvedOverMvi && <ApprovedOverMviMarker />}
    </span>
  )
}
