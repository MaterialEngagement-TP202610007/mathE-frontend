import { useState } from "react"
import { Image } from "lucide-react"
import { cn } from "@/lib/utils"
import type { QuizQuestion } from "../interfaces/questionnaire.interface"

interface QuestionCardProps {
  question: QuizQuestion
  selectedOptionId: number | undefined
  onSelect: (optionId: number) => void
}

const LETTERS = ["A", "B", "C", "D"]

export function QuestionCard({ question, selectedOptionId, onSelect }: QuestionCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const hasMedia = Boolean(question.mediaUrl)
  const showImage = hasMedia && !imgError

  return (
    <div className="w-full">
      <p className="text-lg font-bold leading-snug text-mathe-ink tablet:text-xl">
        {question.statement}
      </p>

      {/* Fixed-height media container — always rendered when question has mediaUrl */}
      {hasMedia && (
        <div className="relative mt-4 overflow-hidden rounded-2xl bg-mathe-surface h-[525px]">
          {showImage ? (
            <>
              {!imgLoaded && (
                <div className="absolute inset-0 animate-pulse rounded-2xl bg-mathe-border/60" />
              )}
              <img
                src={question.mediaUrl!}
                alt="Contenido adjunto"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                className={cn(
                  "h-full w-full rounded-2xl object-cover transition-opacity duration-300",
                  imgLoaded ? "opacity-100" : "opacity-0",
                )}
              />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-mathe-border/30">
                <Image className="size-6 text-mathe-muted/50" />
              </span>
              <p className="text-sm text-mathe-muted">No se pudo cargar la imagen</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {question.options.map((option, i) => {
          const selected = selectedOptionId === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={cn(
                "flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-200",
                selected
                  ? "border-mathe-blue bg-mathe-blue/5 shadow-sm"
                  : "border-mathe-border bg-mathe-white hover:border-mathe-blue/40 hover:bg-mathe-surface",
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors duration-200",
                  selected
                    ? "bg-mathe-blue text-mathe-white"
                    : "bg-mathe-surface text-mathe-muted",
                )}
              >
                {LETTERS[i]}
              </span>
              <span
                className={cn(
                  "mt-0.5 text-sm font-medium leading-relaxed transition-colors duration-200",
                  selected ? "text-mathe-blue" : "text-mathe-ink",
                )}
              >
                {option.text}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
