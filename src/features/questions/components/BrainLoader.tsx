import { Brain } from "lucide-react"
import { useQuestionLoaderStore } from "../store/question-loader.store"

export function BrainLoader() {
  const loading = useQuestionLoaderStore((s) => s.loading)
  const message = useQuestionLoaderStore((s) => s.message)

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/85 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-5">
        <div className="relative grid size-24 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-mathe-blue/10" />
          <span className="absolute inset-[-6px] animate-pulse rounded-full bg-mathe-blue/5" />
          <span className="grid size-24 place-items-center rounded-2xl bg-blue-50 shadow-lg ring-1 ring-mathe-blue/20">
            <Brain className="size-12 animate-pulse text-mathe-blue" />
          </span>
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-mathe-ink">{message}</p>
          <p className="mt-1 text-sm text-mathe-muted">Esto puede tomar unos segundos…</p>
        </div>
      </div>
    </div>
  )
}
