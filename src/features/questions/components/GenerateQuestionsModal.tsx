import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Brain, Clock, Info, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { VakStyleApi } from "../interfaces/question.interface"

const COUNTS = [5, 10, 15, 20]

const VAK_OPTIONS: { value: VakStyleApi; label: string; color: string; active: string }[] = [
  { value: "Visual",      label: "Visual",      color: "border-violet-200 text-violet-600 hover:border-violet-400", active: "border-violet-500 bg-violet-500 text-white shadow-sm" },
  { value: "Auditory",    label: "Auditivo",    color: "border-sky-200 text-sky-600 hover:border-sky-400",         active: "border-sky-500 bg-sky-500 text-white shadow-sm" },
  { value: "Kinesthetic", label: "Kinestésico", color: "border-emerald-200 text-emerald-600 hover:border-emerald-400", active: "border-emerald-500 bg-emerald-500 text-white shadow-sm" },
]

const INFO_ITEMS = [
  "Las preguntas son generadas con Gemini, el modelo de IA de Google.",
  "Podrás revisar y validar cada pregunta antes de que sea usada en el cuestionario.",
  "Las preguntas rechazadas no afectarán la experiencia del estudiante.",
]

interface Props {
  open: boolean
  onClose: () => void
  onGenerate: (count: number, vakStyle: VakStyleApi) => void
}

export function GenerateQuestionsModal({ open, onClose, onGenerate }: Props) {
  const [count, setCount] = useState(10)
  const [vakStyle, setVakStyle] = useState<VakStyleApi>("Visual")

  function handleGenerate() {
    onGenerate(count, vakStyle)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-mathe-border bg-mathe-white shadow-2xl">

              {/* Header */}
              <div className="relative bg-gradient-to-r from-mathe-blue to-blue-400 px-7 py-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
                    <Sparkles className="size-5 text-white" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-100">
                      Gemini AI
                    </p>
                    <h2 className="text-lg font-bold text-white">Generar preguntas</h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="absolute right-5 top-5 grid size-8 place-items-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/25"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Body */}
              <div className="grid gap-5 px-7 py-6">

                {/* Purpose */}
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Brain className="size-4 text-mathe-blue" />
                    <p className="text-sm font-semibold text-mathe-ink">¿Qué hace esto?</p>
                  </div>
                  <p className="text-sm leading-relaxed text-mathe-muted">
                    Gemini genera preguntas de opción múltiple alineadas al estilo VAK seleccionado.
                    Como docente, tu rol es{" "}
                    <strong className="text-mathe-ink">revisar y validar</strong> cada pregunta
                    antes de que forme parte del cuestionario estudiantil.
                  </p>
                </div>

                {/* Info list */}
                <ul className="grid gap-2">
                  {INFO_ITEMS.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-mathe-muted">
                      <Info className="mt-0.5 size-3.5 shrink-0 text-mathe-blue/60" />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* VAK style selector */}
                <div className="grid gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-mathe-muted">
                    Estilo de aprendizaje
                  </p>
                  <div className="flex gap-2">
                    {VAK_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setVakStyle(opt.value)}
                        className={cn(
                          "h-11 flex-1 rounded-pill border text-sm font-bold transition-all",
                          vakStyle === opt.value ? opt.active : opt.color,
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Count selector */}
                <div className="grid gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-mathe-muted">
                    Cantidad a generar
                  </p>
                  <div className="flex gap-2">
                    {COUNTS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCount(c)}
                        className={cn(
                          "h-11 flex-1 rounded-pill border text-sm font-bold transition-all",
                          count === c
                            ? "border-mathe-blue bg-mathe-blue text-white shadow-sm"
                            : "border-mathe-border bg-mathe-white text-mathe-muted hover:border-mathe-blue/40 hover:text-mathe-ink",
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time warning */}
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  <p className="text-xs text-amber-700">
                    Esta operación puede tomar entre{" "}
                    <strong>10–30 segundos</strong> dependiendo de la cantidad solicitada.
                    Por favor no cierres la ventana.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-11 flex-1 rounded-pill border border-mathe-border text-sm font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-pill bg-mathe-blue text-sm font-semibold text-white shadow-sm transition-colors hover:bg-mathe-blue/90"
                  >
                    <Sparkles className="size-4" />
                    Generar {count} preguntas
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
