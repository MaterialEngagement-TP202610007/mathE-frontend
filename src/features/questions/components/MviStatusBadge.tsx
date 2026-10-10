import { CircleDashed, CloudOff, ShieldAlert, ShieldCheck } from "lucide-react"
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
  className?: string
}

/** Pill badge for the MVI (validation engine) diagnosis of a question. */
export function MviStatusBadge({ status, className }: MviStatusBadgeProps) {
  const key: BadgeKey = status && status in STATUSES ? status : "none"
  const { label, icon: Icon, className: tone } = STATUSES[key]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      {label}
    </span>
  )
}
