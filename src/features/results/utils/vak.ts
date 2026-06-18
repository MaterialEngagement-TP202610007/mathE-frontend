import type { VakStyleApi } from "../interfaces/result.interface"
import type { VakStyle } from "@/features/dashboard/components/VakBadge"

/** Map backend English enum values to Spanish display labels used by VakBadge. */
export function toDisplayStyle(api: VakStyleApi): VakStyle {
  const map: Record<VakStyleApi, VakStyle> = {
    Visual: "Visual",
    Auditory: "Auditivo",
    Kinesthetic: "Kinestésico",
  }
  return map[api]
}

export const VAK_COLORS: Record<VakStyleApi, { bar: string; text: string }> = {
  Visual: { bar: "bg-mathe-blue", text: "text-mathe-blue" },
  Auditory: { bar: "bg-emerald-500", text: "text-emerald-600" },
  Kinesthetic: { bar: "bg-amber-500", text: "text-amber-600" },
}
