/** Evolution chart period presets (HU-34). "all" sends no `from`, so the backend starts at the first result. */
export type EvolutionPeriod = "all" | "3m" | "1y"

export const EVOLUTION_PERIODS: { value: EvolutionPeriod; label: string }[] = [
  { value: "all", label: "Todo" },
  { value: "3m", label: "Últimos 3 meses" },
  { value: "1y", label: "Último año" },
]

/** Minimum results needed to draw a comparison over time. */
export const MIN_EVOLUTION_RESULTS = 2

function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/**
 * Local start date (YYYY-MM-DD) for the `from` query param of
 * `GET /results/evolution/:studentId`, or `undefined` for the whole history.
 */
export function evolutionPeriodFrom(period: EvolutionPeriod, now: Date = new Date()): string | undefined {
  if (period === "all") return undefined
  const start = new Date(now)
  if (period === "3m") start.setMonth(start.getMonth() - 3)
  else start.setFullYear(start.getFullYear() - 1)
  return toIsoDate(start)
}
