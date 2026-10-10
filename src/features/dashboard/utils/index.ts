import type { VakStyleApi } from "@/features/results/interfaces/result.interface"
import { toDisplayStyle } from "@/features/results/utils/vak"
import type { VakStyle } from "../components/VakBadge"

/** Spanish label for a VAK style; unknown/missing styles get a neutral fallback. */
export function toSpanishStyle(vakStyle: VakStyleApi | string | null | undefined): VakStyle {
  return toDisplayStyle(vakStyle)
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
