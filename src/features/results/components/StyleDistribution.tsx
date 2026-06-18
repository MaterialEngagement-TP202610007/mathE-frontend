import { cn } from "@/lib/utils"
import type { QuizResult, VakStyleApi } from "../interfaces/result.interface"
import { toDisplayStyle, VAK_COLORS } from "../utils/vak"

interface StyleDistributionProps {
  result: QuizResult
}

const STYLES: VakStyleApi[] = ["Visual", "Auditory", "Kinesthetic"]

function getProb(result: QuizResult, style: VakStyleApi): number {
  return style === "Visual"
    ? result.visualProbability
    : style === "Auditory"
      ? result.auditoryProbability
      : result.kinestheticProbability
}

export function StyleDistribution({ result }: StyleDistributionProps) {
  return (
    <div className="rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm">
      <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-mathe-muted">
        Distribución de estilos
      </p>
      <div className="grid gap-4">
        {STYLES.map((style) => {
          const pct = getProb(result, style)
          const { bar, text } = VAK_COLORS[style]
          return (
            <div key={style} className="grid grid-cols-[5rem_1fr_3rem] items-center gap-3">
              <span className={cn("text-sm font-semibold", text)}>
                {toDisplayStyle(style)}
              </span>
              <div className="h-2.5 overflow-hidden rounded-full bg-mathe-border">
                <div
                  className={cn("h-full rounded-full transition-all duration-700 ease-out", bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={cn("text-right text-sm font-bold", text)}>{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
