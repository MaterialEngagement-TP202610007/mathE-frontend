import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  History,
  Image,
  ImageOff,
  Sparkles,
  X,
  XCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { ROUTING } from "@/config/constant.config"
import { questionService } from "../services/question.service"
import { useQuestionLoaderStore } from "../store/question-loader.store"
import { VakBadge } from "@/features/dashboard/components/VakBadge"
import { toSpanishStyle, formatQuestionId, formatDate } from "@/features/dashboard/utils"
import { cn } from "@/lib/utils"
import type { Question } from "../interfaces/question.interface"

// ── VAK helpers ───────────────────────────────────────────────────────────────

const VAK_OPTION_COLORS: Record<"V" | "A" | "K", string> = {
  V: "text-mathe-blue bg-blue-50 border-blue-100",
  A: "text-emerald-600 bg-emerald-50 border-emerald-100",
  K: "text-amber-600 bg-amber-50 border-amber-100",
}

const OPTION_LABELS = ["A", "B", "C", "D", "E"]

// ── Sub-components ────────────────────────────────────────────────────────────

function MediaSection({
  question,
  imgError,
  onImgError,
}: {
  question: Question
  imgError: boolean
  onImgError: () => void
}) {
  const [loaded, setLoaded] = useState(false)

  // Reset loaded state when the question changes
  useEffect(() => { setLoaded(false) }, [question.id])

  const hasMedia = Boolean(question.mediaUrl) && !imgError

  return (
    <div className="relative h-[525px] w-full overflow-hidden rounded-2xl bg-mathe-surface">
      {hasMedia ? (
        <>
          {/* Skeleton while loading */}
          <AnimatePresence>
            {!loaded && (
              <motion.div
                key="skeleton"
                className="absolute inset-0 animate-pulse rounded-2xl bg-mathe-border/50"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
          <img
            src={question.mediaUrl!}
            alt="Contenido adjunto"
            onLoad={() => setLoaded(true)}
            onError={onImgError}
            className={cn(
              "h-full w-full rounded-2xl object-cover transition-opacity duration-300",
              loaded ? "opacity-100" : "opacity-0",
            )}
          />
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-mathe-border/30">
            <Image className="size-7 text-mathe-muted/50" />
          </span>
          <div>
            <p className="text-sm font-medium text-mathe-muted">
              {imgError ? "No se pudo cargar la imagen" : "Sin contenido multimedia"}
            </p>
            {imgError && (
              <span className="mt-1 flex items-center justify-center gap-1 text-xs text-red-400">
                <ImageOff className="size-3" /> URL inaccesible
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function OptionItem({
  label,
  text,
  vakValue,
}: {
  label: string
  text: string
  vakValue: "V" | "A" | "K"
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-mathe-border bg-mathe-white px-4 py-3 transition-colors hover:border-mathe-blue/20 hover:bg-blue-50/20">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-mathe-surface text-xs font-bold text-mathe-muted">
        {label}
      </span>
      <p className="flex-1 text-sm text-mathe-ink">{text}</p>
      <span
        className={cn(
          "mt-0.5 shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-bold",
          VAK_OPTION_COLORS[vakValue],
        )}
      >
        {vakValue}
      </span>
    </div>
  )
}

function ConfirmModal({
  open,
  mode,
  onConfirm,
  onCancel,
}: {
  open: boolean
  mode: "approve" | "reject"
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  const isApprove = mode === "approve"
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-mathe-ink/40 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl bg-mathe-white p-8 shadow-2xl"
      >
        <div
          className={cn(
            "mb-4 grid size-12 place-items-center rounded-xl",
            isApprove ? "bg-emerald-50" : "bg-red-50",
          )}
        >
          {isApprove ? (
            <CheckCircle2 className="size-6 text-emerald-600" />
          ) : (
            <AlertTriangle className="size-6 text-red-500" />
          )}
        </div>
        <h3 className="text-lg font-bold text-mathe-ink">
          {isApprove ? "¿Aprobar esta pregunta?" : "¿Rechazar esta pregunta?"}
        </h3>
        <p className="mt-2 text-sm text-mathe-muted">
          {isApprove
            ? "Esta pregunta quedará aprobada y podrá aparecer en el cuestionario que realizan los estudiantes."
            : "Esta pregunta quedará rechazada y no será visible en el cuestionario para los estudiantes."}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-pill border border-mathe-border bg-mathe-white py-2.5 text-sm font-semibold text-mathe-ink transition-colors hover:bg-mathe-surface"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "flex-1 rounded-pill py-2.5 text-sm font-semibold text-mathe-white transition-colors",
              isApprove
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-500 hover:bg-red-600",
            )}
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function NoMoreModal({
  open,
  onConfirm,
}: {
  open: boolean
  onConfirm: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-mathe-ink/40 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl bg-mathe-white p-8 shadow-2xl text-center"
      >
        <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-blue-50 mx-auto">
          <Sparkles className="size-7 text-mathe-blue" />
        </div>
        <h3 className="text-lg font-bold text-mathe-ink">¡Revisión completada!</h3>
        <p className="mt-2 text-sm text-mathe-muted">
          No quedan más preguntas pendientes. Puedes consultar el historial de validación para
          ver las preguntas aprobadas y rechazadas.
        </p>
        <button
          type="button"
          onClick={onConfirm}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-pill bg-mathe-blue py-3 text-sm font-semibold text-mathe-white transition-colors hover:bg-mathe-blue/90"
        >
          <History className="size-4" />
          Ir al historial de validación
        </button>
      </motion.div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function QuestionReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const setGlobalLoading = useQuestionLoaderStore((s) => s.setLoading)

  const [question, setQuestion] = useState<Question | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [imgError, setImgError] = useState(false)

  const [mode, setMode] = useState<"approve" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [reasonError, setReasonError] = useState("")

  const [showConfirm, setShowConfirm] = useState(false)
  const [showNoMore, setShowNoMore] = useState(false)

  useEffect(() => {
    if (!id) return
    setPageLoading(true)
    setMode(null)
    setRejectionReason("")
    setReasonError("")
    setImgError(false)
    questionService
      .getById(Number(id))
      .then(setQuestion)
      .catch(() => navigate(ROUTING.DASHBOARD_QUESTIONS))
      .finally(() => setPageLoading(false))
  }, [id, navigate])

  function handleSubmit() {
    if (mode === "reject" && !rejectionReason.trim()) {
      setReasonError("El motivo de rechazo es requerido.")
      return
    }
    setReasonError("")
    setShowConfirm(true)
  }

  async function handleConfirm() {
    if (!id || !mode) return
    setShowConfirm(false)
    const label = mode === "approve" ? "Aprobando pregunta…" : "Rechazando pregunta…"
    setGlobalLoading(true, label)
    try {
      if (mode === "approve") {
        await questionService.approve(Number(id))
      } else {
        await questionService.reject(Number(id), { rejectionReason: rejectionReason.trim() })
      }
      // Find the next pending question (skip the one we just validated)
      const next = await questionService.listMy({ status: "pending", limit: 1 })
      const nextQuestion = next.items.find((q) => q.id !== Number(id))
      if (nextQuestion) {
        navigate(`/dashboard/preguntas/${nextQuestion.id}`)
      } else {
        setShowNoMore(true)
      }
    } catch {
      // silent — toast can be added later
    } finally {
      setGlobalLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Brain className="size-10 animate-pulse text-mathe-blue" />
          <p className="text-sm text-mathe-muted">Cargando pregunta…</p>
        </div>
      </div>
    )
  }

  if (!question) return null

  return (
    <>
      <motion.div
        className="grid gap-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => navigate(ROUTING.DASHBOARD_QUESTIONS)}
            className="flex items-center gap-1.5 font-semibold text-mathe-blue hover:underline"
          >
            <ArrowLeft className="size-4" />
            Preguntas pendientes
          </button>
          <span className="text-mathe-muted">/</span>
          <span className="font-semibold text-mathe-ink">{formatQuestionId(question.id)}</span>
        </nav>

        {/* ── Two-column layout ── */}
        <div className="grid gap-6 laptop:grid-cols-3">

          {/* ── Left: Question card ── */}
          <div className="grid gap-4 laptop:col-span-2">
            <div className="rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm">
              {/* Card header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <code className="rounded-lg bg-mathe-surface px-2 py-1 font-mono text-[11px] font-semibold text-mathe-muted">
                    {formatQuestionId(question.id)}
                  </code>
                  <VakBadge style={toSpanishStyle(question.vakStyle)} />
                </div>
                <span className="text-sm text-mathe-muted">
                  {formatDate(question.generationDate)}
                </span>
              </div>

              {/* Statement */}
              <h2 className="text-lg font-bold leading-snug text-mathe-ink">
                {question.statement}
              </h2>

              {/* Media — always rendered; shows skeleton/fallback when no URL */}
              <div className="mt-4">
                <MediaSection
                  question={question}
                  imgError={imgError}
                  onImgError={() => setImgError(true)}
                />
              </div>

              {/* Options */}
              <div className="mt-6">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
                  Opciones de respuesta
                </p>
                <div className="grid gap-2">
                  {question.options.map((opt, idx) => (
                    <OptionItem
                      key={opt.id}
                      label={OPTION_LABELS[idx] ?? String(idx + 1)}
                      text={opt.text}
                      vakValue={opt.vakValue}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Validation panel ── */}
          <div className="laptop:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm">
              <h3 className="mb-5 text-base font-bold text-mathe-ink">Validar pregunta</h3>

              {/* Mode tabs */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("approve")}
                  className={cn(
                    "rounded-pill py-2.5 text-sm font-semibold transition-all",
                    mode === "approve"
                      ? "bg-emerald-600 text-mathe-white shadow-sm"
                      : "border border-mathe-border bg-mathe-white text-mathe-muted hover:border-emerald-300 hover:text-emerald-600",
                  )}
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("reject"); setReasonError("") }}
                  className={cn(
                    "rounded-pill py-2.5 text-sm font-semibold transition-all",
                    mode === "reject"
                      ? "bg-red-500 text-mathe-white shadow-sm"
                      : "border border-mathe-border bg-mathe-white text-mathe-muted hover:border-red-300 hover:text-red-500",
                  )}
                >
                  Rechazar
                </button>
              </div>

              {/* Rejection reason */}
              <AnimatePresence>
                {mode === "reject" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4">
                      <label className="mb-1.5 block text-xs font-semibold text-mathe-muted">
                        Motivo de rechazo <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => { setRejectionReason(e.target.value); setReasonError("") }}
                        rows={4}
                        placeholder="Describe el motivo del rechazo…"
                        className={cn(
                          "w-full resize-none rounded-xl border bg-mathe-white p-3 text-sm text-mathe-ink outline-none transition-colors placeholder:text-mathe-muted/60",
                          reasonError
                            ? "border-red-300 focus:border-red-400"
                            : "border-mathe-border focus:border-mathe-blue/50",
                        )}
                      />
                      {reasonError && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                          <XCircle className="size-3" />
                          {reasonError}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <AnimatePresence>
                {mode !== null && (
                  <motion.button
                    key={mode}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="button"
                    onClick={handleSubmit}
                    className={cn(
                      "mt-4 flex w-full items-center justify-center gap-2 rounded-pill py-3 text-sm font-semibold text-mathe-white transition-colors",
                      mode === "approve"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-red-500 hover:bg-red-600",
                    )}
                  >
                    {mode === "approve" ? (
                      <>
                        <CheckCircle2 className="size-4" />
                        Aprobar pregunta
                      </>
                    ) : (
                      <>
                        <X className="size-4" />
                        Rechazar pregunta
                      </>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>

              {mode === null && (
                <p className="mt-4 text-center text-xs text-mathe-muted">
                  Selecciona una acción para continuar
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Modals ── */}
      {mode && (
        <ConfirmModal
          open={showConfirm}
          mode={mode}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      <NoMoreModal
        open={showNoMore}
        onConfirm={() => navigate(ROUTING.DASHBOARD_VALIDATION_HISTORY)}
      />
    </>
  )
}
