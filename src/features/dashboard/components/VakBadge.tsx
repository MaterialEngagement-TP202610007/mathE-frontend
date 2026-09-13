import { Activity, CircleHelp, Eye, Headphones } from "lucide-react"
import type { ComponentType } from "react"
import { cn } from "@/lib/utils"

/** Label shown when the backend returns a missing or unrecognized style. */
export const UNKNOWN_VAK_STYLE = "Sin definir"

export type VakStyle = "Visual" | "Auditivo" | "Kinestésico" | typeof UNKNOWN_VAK_STYLE

const STYLES: Record<
  VakStyle,
  { icon: ComponentType<{ className?: string }>; className: string }
> = {
  Visual: { icon: Eye, className: "bg-blue-50 text-mathe-blue" },
  Auditivo: { icon: Headphones, className: "bg-emerald-50 text-emerald-600" },
  Kinestésico: { icon: Activity, className: "bg-amber-50 text-amber-600" },
  [UNKNOWN_VAK_STYLE]: { icon: CircleHelp, className: "bg-mathe-surface text-mathe-muted" },
}

interface VakBadgeProps {
  style: VakStyle | null | undefined
  className?: string
}

/** Pill badge for a VAK learning style (Visual / Auditivo / Kinestésico). */
export function VakBadge({ style, className }: VakBadgeProps) {
  const label: VakStyle = style && style in STYLES ? style : UNKNOWN_VAK_STYLE
  const { icon: Icon, className: tone } = STYLES[label]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  )
}
