import { cn } from "@/lib/utils"
import type { QuizQuestion } from "../interfaces/questionnaire.interface"

interface QuestionCardProps {
  question: QuizQuestion
  selectedOptionId: number | undefined
  onSelect: (optionId: number) => void
}

const LETTERS = ["A", "B", "C", "D"]

export function QuestionCard({ question, selectedOptionId, onSelect }: QuestionCardProps) {
  return (
    <div className="w-full max-w-2xl">
      <p className="text-lg font-bold leading-snug text-mathe-ink tablet:text-xl">
        {question.statement}
      </p>

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
