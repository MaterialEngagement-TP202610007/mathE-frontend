import { ArrowRight, CheckCircle2 } from "lucide-react"
import { motion } from "motion/react"

interface SubmissionConfirmationProps {
  onViewResult: () => void
}

/** Confirms the questionnaire was received before the student opens the result. */
export function SubmissionConfirmation({ onViewResult }: SubmissionConfirmationProps) {
  return (
    <motion.div
      role="status"
      className="flex w-full max-w-md flex-col items-center text-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <span className="grid size-20 place-items-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="size-10" />
      </span>
      <h1 className="mt-8 text-2xl font-bold text-mathe-ink tablet:text-3xl">
        ¡Cuestionario enviado con éxito!
      </h1>
      <p className="mt-2 text-mathe-muted">Tus respuestas fueron recibidas correctamente.</p>
      <button
        type="button"
        onClick={onViewResult}
        className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-pill bg-mathe-blue px-8 text-sm font-semibold text-mathe-white transition-colors hover:bg-mathe-blue-deep"
      >
        Ver mi resultado
        <ArrowRight className="size-4" />
      </button>
    </motion.div>
  )
}
