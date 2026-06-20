import type { VakStyleApi } from "@/features/results/interfaces/result.interface"
import type { VakStyle } from "../components/VakBadge"

export function toSpanishStyle(vakStyle: VakStyleApi): VakStyle {
  const map: Record<VakStyleApi, VakStyle> = {
    Visual: "Visual",
    Auditory: "Auditivo",
    Kinesthetic: "Kinestésico",
  }
  return map[vakStyle]
}

export function formatQuestionId(id: number) {
  return `Q-${String(id).padStart(4, "0")}`
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function isThisMonth(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}
