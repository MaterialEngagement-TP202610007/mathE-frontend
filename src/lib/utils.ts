import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Rounds a 0–100 value for display; missing or invalid values render as "—". */
export function formatPercent(value: number | null | undefined, decimals = 0): string {
  const n = Number(value)
  if (value === null || value === undefined || !Number.isFinite(n)) return "—"
  return `${n.toFixed(decimals)}%`
}

/** Safe 0–100 number for widths/charts; invalid values become 0. */
export function clampPercent(value: number | null | undefined): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.min(100, Math.max(0, Math.round(n)))
}
