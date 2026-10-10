import type { VakStyleApi } from "../interfaces/result.interface"
import { UNKNOWN_VAK_STYLE, type VakStyle } from "@/features/dashboard/components/VakBadge"

const DISPLAY_STYLE: Record<VakStyleApi, VakStyle> = {
  Visual: "Visual",
  Auditory: "Auditivo",
  Kinesthetic: "Kinestésico",
}

export function isVakStyleApi(style: unknown): style is VakStyleApi {
  return typeof style === "string" && Object.hasOwn(DISPLAY_STYLE, style)
}

/**
 * Map backend English enum values to Spanish display labels used by VakBadge.
 * Unknown or missing styles fall back to a neutral label instead of crashing.
 */
export function toDisplayStyle(api: VakStyleApi | string | null | undefined): VakStyle {
  return isVakStyleApi(api) ? DISPLAY_STYLE[api] : UNKNOWN_VAK_STYLE
}

export const VAK_COLORS: Record<VakStyleApi, { bar: string; text: string }> = {
  Visual: { bar: "bg-mathe-blue", text: "text-mathe-blue" },
  Auditory: { bar: "bg-emerald-500", text: "text-emerald-600" },
  Kinesthetic: { bar: "bg-amber-500", text: "text-amber-600" },
}

const NEUTRAL_COLORS = { bar: "bg-mathe-muted", text: "text-mathe-muted" }

/** Safe lookup into VAK_COLORS with a neutral fallback. */
export function vakColors(style: VakStyleApi | string | null | undefined): { bar: string; text: string } {
  return isVakStyleApi(style) ? VAK_COLORS[style] : NEUTRAL_COLORS
}

/** Safe lookup into any per-style table, returning `fallback` for unknown styles. */
export function lookupVak<T>(
  table: Record<VakStyleApi, T>,
  style: VakStyleApi | string | null | undefined,
  fallback: T,
): T {
  return isVakStyleApi(style) ? table[style] : fallback
}
