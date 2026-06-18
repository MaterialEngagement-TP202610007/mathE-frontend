interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100)

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-sm font-medium">
        <span className="text-mathe-muted">
          Pregunta{" "}
          <span className="font-bold text-mathe-ink">{current}</span> de {total}
        </span>
        <span className="font-semibold text-mathe-blue">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-mathe-border">
        <div
          className="h-full rounded-full bg-mathe-blue transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
