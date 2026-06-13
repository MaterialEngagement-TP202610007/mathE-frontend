import { Activity, Eye, Headphones } from "lucide-react"
import type { ComponentType } from "react"
import { cn } from "@/lib/utils"

export type VakStyle = "Visual" | "Auditivo" | "Kinestésico"

const STYLES: Record<
  VakStyle,
  { icon: ComponentType<{ className?: string }>; className: string }
> = {
  Visual: { icon: Eye, className: "bg-blue-50 text-mathe-blue" },
  Auditivo: { icon: Headphones, className: "bg-emerald-50 text-emerald-600" },
  Kinestésico: { icon: Activity, className: "bg-amber-50 text-amber-600" },
}

interface VakBadgeProps {
  style: VakStyle
  className?: string
}

/** Pill badge for a VAK learning style (Visual / Auditivo / Kinestésico). */
export function VakBadge({ style, className }: VakBadgeProps) {
  const { icon: Icon, className: tone } = STYLES[style]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" />
      {style}
    </span>
  )
}
