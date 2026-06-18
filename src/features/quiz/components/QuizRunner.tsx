import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Pencil,
  Send,
  TriangleAlert,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useQuizStore } from "../store/quiz.store"
import { questionnaireService } from "../services/questionnaire.service"
import { useQuestionBehaviour } from "../hooks/use-question-behaviour"
import { ProgressBar } from "./ProgressBar"
import { QuestionCard } from "./QuestionCard"
import type { QuizQuestion, QuizAnswerRecord } from "../interfaces/questionnaire.interface"
import type { QuizResult } from "@/features/results/interfaces/result.interface"

type RunnerPhase = "answering" | "review" | "submitting"

interface QuizRunnerProps {
  onComplete: (result: QuizResult) => void
}

export function QuizRunner({ onComplete }: QuizRunnerProps) {
  // ── All hooks must be called unconditionally before any early return ──
  const session = useQuizStore((s) => s.session)
  const setAnswer = useQuizStore((s) => s.setAnswer)
  const setCurrentIndex = useQuizStore((s) => s.setCurrentIndex)
  const [runnerPhase, setRunnerPhase] = useState<RunnerPhase>("answering")
  const [direction, setDirection] = useState<1 | -1>(1)

  // Derive a stable questionId for the behaviour hook even when session is null.
  const activeQuestionId = session?.questions[session.currentIndex]?.questionId ?? 0
  const { markAnswered, flushCurrent, getBehaviour } = useQuestionBehaviour(activeQuestionId)

  // Session is cleared by QuizPage right before navigating away — render nothing.
  if (!session) return null

  const { currentIndex, questions, answers, questionnaireId } = session
  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers[currentQuestion.questionId]
  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === questions.length
  const isLastQuestion = currentIndex === questions.length - 1

  const handleOptionSelect = (optionId: number) => {
    markAnswered(currentQuestion.questionId, optionId)
    setAnswer(currentQuestion.questionId, { selectedOptionId: optionId })
  }

  const goTo = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  const handleSubmit = async () => {
    flushCurrent()
    setRunnerPhase("submitting")
    try {
      const answerItems = questions.map((q) => {
        const answer = answers[q.questionId]
        const behaviour = getBehaviour(q.questionId)
        return {
          questionId: q.questionId,
          selectedOptionId: answer.selectedOptionId,
          ...behaviour,
        }
      })

      const result = await questionnaireService.submit(questionnaireId, {
        completionPercentage: Math.round((answeredCount / questions.length) * 100),
        answers: answerItems,
      })

      toast.success("¡Cuestionario completado!")
      onComplete(result)
    } catch {
      toast.error("No se pudo enviar el cuestionario. Intenta de nuevo.")
      setRunnerPhase("review")
    }
  }

  if (runnerPhase === "submitting") {
    return (
      <div className="flex flex-col items-center justify-center gap-5 text-center animate-fade-in">
        <div className="relative grid size-24 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-mathe-blue/20" />
          <span className="relative grid size-16 place-items-center rounded-2xl bg-mathe-blue text-mathe-white shadow-sm">
            <Send className="size-7" />
          </span>
        </div>
        <p className="text-xl font-bold text-mathe-ink">Enviando cuestionario…</p>
        <p className="text-sm text-mathe-muted">Esto tomará solo un momento.</p>
      </div>
    )
  }

  if (runnerPhase === "review") {
    return (
      <ReviewScreen
        questions={questions}
        answers={answers}
        allAnswered={allAnswered}
        onEditQuestion={(index) => {
          setDirection(index > currentIndex ? 1 : -1)
          setCurrentIndex(index)
          setRunnerPhase("answering")
        }}
        onSubmit={handleSubmit}
      />
    )
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <ProgressBar current={currentIndex + 1} total={questions.length} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: d * 56, opacity: 0, scale: 0.98 }),
            center: { x: 0, opacity: 1, scale: 1 },
            exit: (d: number) => ({ x: d * -56, opacity: 0, scale: 0.98 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
        >
          <QuestionCard
            question={currentQuestion}
            selectedOptionId={currentAnswer?.selectedOptionId}
            onSelect={handleOptionSelect}
          />
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => goTo(currentIndex - 1)}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-pill border border-mathe-border bg-mathe-white px-5 text-sm font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface",
            currentIndex === 0 && "invisible pointer-events-none",
          )}
        >
          <ArrowLeft className="size-4" />
          Anterior
        </button>

        <div className="flex items-center gap-1.5">
          {questions.map((q, i) => (
            <button
              key={q.questionId}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir a pregunta ${i + 1}`}
              className={cn(
                "rounded-full transition-all duration-300",
                i === currentIndex
                  ? "size-3 bg-mathe-blue"
                  : answers[q.questionId]
                    ? "size-2 bg-mathe-blue/40 hover:bg-mathe-blue/60"
                    : "size-2 bg-mathe-border hover:bg-mathe-muted/30",
              )}
            />
          ))}
        </div>

        {isLastQuestion ? (
          <button
            type="button"
            onClick={() => setRunnerPhase("review")}
            className="inline-flex h-11 items-center gap-2 rounded-pill bg-mathe-blue px-5 text-sm font-semibold text-mathe-white transition-colors hover:bg-mathe-blue-deep"
          >
            <CheckCircle2 className="size-4" />
            Revisar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goTo(currentIndex + 1)}
            className="inline-flex h-11 items-center gap-2 rounded-pill bg-mathe-blue px-5 text-sm font-semibold text-mathe-white transition-colors hover:bg-mathe-blue-deep"
          >
            Siguiente
            <ArrowRight className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}

interface ReviewScreenProps {
  questions: QuizQuestion[]
  answers: Record<number, QuizAnswerRecord>
  allAnswered: boolean
  onEditQuestion: (index: number) => void
  onSubmit: () => void
}

function ReviewScreen({
  questions,
  answers,
  allAnswered,
  onEditQuestion,
  onSubmit,
}: ReviewScreenProps) {
  const unansweredCount = questions.filter((q) => !answers[q.questionId]).length

  return (
    <motion.div
      className="w-full max-w-2xl"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 32 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-mathe-ink">Revisa tus respuestas</h2>
        <p className="mt-1 text-sm text-mathe-muted">
          Verifica que hayas respondido todas las preguntas antes de enviar.
        </p>
      </div>

      {!allAnswered && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5">
          <TriangleAlert className="size-4 shrink-0 text-amber-600" />
          <p className="text-sm font-medium text-amber-800">
            {unansweredCount === 1
              ? "Falta 1 pregunta sin responder"
              : `Faltan ${unansweredCount} preguntas sin responder`}
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {questions.map((q, i) => {
          const answer = answers[q.questionId]
          const selectedOption = answer
            ? q.options.find((o) => o.id === answer.selectedOptionId)
            : null

          return (
            <div
              key={q.questionId}
              className={cn(
                "flex items-start gap-4 rounded-2xl border px-5 py-4 transition-colors",
                answer
                  ? "border-mathe-border bg-mathe-white"
                  : "border-amber-200 bg-amber-50/60",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                  answer
                    ? "bg-mathe-blue/10 text-mathe-blue"
                    : "bg-amber-100 text-amber-700",
                )}
              >
                {i + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-mathe-ink">
                  {q.statement}
                </p>
                {selectedOption ? (
                  <p className="mt-1 text-sm text-mathe-muted">{selectedOption.text}</p>
                ) : (
                  <p className="mt-1 text-sm font-medium text-amber-700">Sin responder</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onEditQuestion(i)}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-pill border border-mathe-border bg-mathe-white px-3 text-xs font-semibold text-mathe-muted transition-colors hover:bg-mathe-surface hover:text-mathe-ink"
              >
                <Pencil className="size-3" />
                Cambiar
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 tablet:flex-row tablet:justify-end">
        <button
          type="button"
          onClick={() => onEditQuestion(0)}
          className="inline-flex h-12 items-center justify-center rounded-pill border border-mathe-border bg-mathe-white px-6 text-sm font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface"
        >
          <ArrowLeft className="mr-2 size-4" />
          Volver al cuestionario
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!allAnswered}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-mathe-blue px-8 text-sm font-semibold text-mathe-white transition-colors hover:bg-mathe-blue-deep disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-mathe-blue"
        >
          <Send className="size-4" />
          Enviar cuestionario
        </button>
      </div>
    </motion.div>
  )
}
