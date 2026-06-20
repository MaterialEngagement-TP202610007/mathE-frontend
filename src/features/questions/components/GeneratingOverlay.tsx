import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Sparkles } from "lucide-react"

const TIPS = [
  "Gemini analiza el currículo nacional para crear preguntas contextualizadas.",
  "Cada pregunta se diseña para activar el estilo de aprendizaje correcto.",
  "Las opciones de respuesta revelan el estilo VAK del estudiante.",
  "El modelo balancea dificultad y claridad en cada ítem generado.",
  "Las preguntas pasan por un filtro de coherencia pedagógica interna.",
  "Cada opción está alineada con uno de los tres estilos: Visual, Auditivo o Kinestésico.",
]

interface Props {
  visible: boolean
}

export function GeneratingOverlay({ visible }: Props) {
  const [tipIdx, setTipIdx] = useState(0)
  const [showTip, setShowTip] = useState(true)

  useEffect(() => {
    if (!visible) return
    const id = setInterval(() => {
      setShowTip(false)
      setTimeout(() => {
        setTipIdx((i) => (i + 1) % TIPS.length)
        setShowTip(true)
      }, 350)
    }, 4000)
    return () => clearInterval(id)
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="generating-overlay"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/92 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Orb */}
          <div className="relative mb-10 flex items-center justify-center">
            <motion.span
              className="absolute size-24 rounded-full bg-mathe-blue/15"
              animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="absolute size-36 rounded-full bg-mathe-blue/8"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            />
            <motion.div
              className="relative grid size-24 place-items-center rounded-3xl bg-gradient-to-br from-mathe-blue to-blue-400 shadow-xl shadow-mathe-blue/30"
              animate={{ rotate: [0, 4, -4, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="size-10 text-white" />
              </motion.div>
            </motion.div>
          </div>

          {/* Heading */}
          <motion.p
            className="mb-1 text-xl font-bold text-mathe-ink"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Gemini está generando tus preguntas
          </motion.p>
          <motion.p
            className="mb-10 text-sm text-mathe-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            Esto puede tomar entre 10 y 30 segundos…
          </motion.p>

          {/* Rotating tip card */}
          <motion.div
            className="flex min-h-[76px] w-full max-w-sm items-center rounded-2xl border border-mathe-border bg-mathe-white px-6 py-4 shadow-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AnimatePresence mode="wait">
              {showTip && (
                <motion.p
                  key={tipIdx}
                  className="w-full text-center text-sm text-mathe-muted"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28 }}
                >
                  <span className="font-semibold text-mathe-ink">¿Sabías que? </span>
                  {TIPS[tipIdx]}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Pulse dots */}
          <div className="mt-8 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-2 rounded-full bg-mathe-blue"
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
