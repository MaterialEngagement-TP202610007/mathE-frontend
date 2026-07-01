import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Image,
  ImageOff,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ROUTING } from "@/config/constant.config";
import { questionService } from "../services/question.service";
import { VakBadge } from "@/features/dashboard/components/VakBadge";
import {
  toSpanishStyle,
  formatQuestionId,
  formatDate,
} from "@/features/dashboard/utils";
import { cn } from "@/lib/utils";
import type { Question } from "../interfaces/question.interface";

const VAK_OPTION_COLORS: Record<"V" | "A" | "K", string> = {
  V: "text-mathe-blue bg-blue-50 border-blue-100",
  A: "text-emerald-600 bg-emerald-50 border-emerald-100",
  K: "text-amber-600 bg-amber-50 border-amber-100",
};

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

function MediaSection({
  question,
  imgError,
  onImgError,
}: {
  question: Question;
  imgError: boolean;
  onImgError: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(false); }, [question.id]);

  const hasMedia = Boolean(question.mediaUrl) && !imgError;

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-mathe-surface">
      {hasMedia ? (
        <>
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
  );
}

function OptionItem({
  label,
  text,
  vakValue,
}: {
  label: string;
  text: string;
  vakValue: "V" | "A" | "K";
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-mathe-border bg-mathe-white px-4 py-3">
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
  );
}

export function ValidationHistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<Question | null>(null);
  const [siblingIds, setSiblingIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setImgError(false);
    setQuestion(null);

    Promise.all([
      questionService.getById(Number(id)),
      questionService.listValidatedHistory({ limit: 100 }),
    ])
      .then(([q, history]) => {
        setQuestion(q);
        setSiblingIds(history.items.map((i) => i.id));
      })
      .catch(() => navigate(ROUTING.DASHBOARD_VALIDATION_HISTORY))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const currentIndex = siblingIds.indexOf(Number(id));
  const prevId = currentIndex > 0 ? siblingIds[currentIndex - 1] : null;
  const nextId =
    currentIndex < siblingIds.length - 1 ? siblingIds[currentIndex + 1] : null;

  function goTo(targetId: number) {
    navigate(`${ROUTING.DASHBOARD_VALIDATION_HISTORY}/${targetId}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Brain className="size-10 animate-pulse text-mathe-blue" />
          <p className="text-sm text-mathe-muted">Cargando pregunta…</p>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const isApproved = question.validationStatus === "approved";

  return (
    <motion.div
      className="grid gap-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {/* ── Preview banner ── */}
      <div className="flex items-center gap-2.5 rounded-xl border border-mathe-blue/20 bg-blue-50/60 px-4 py-2.5">
        <Eye className="size-4 shrink-0 text-mathe-blue" />
        <p className="text-sm font-semibold text-mathe-blue">
          Vista previa — solo lectura
        </p>
        <span className="ml-auto text-xs text-mathe-muted">
          No puedes realizar acciones sobre esta pregunta desde aquí
        </span>
      </div>

      {/* ── Breadcrumb + navigation ── */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => navigate(ROUTING.DASHBOARD_VALIDATION_HISTORY)}
            className="flex items-center gap-1.5 font-semibold text-mathe-blue hover:underline"
          >
            <ArrowLeft className="size-4" />
            Historial de validación
          </button>
          <span className="text-mathe-muted">/</span>
          <span className="font-semibold text-mathe-ink">
            {formatQuestionId(question.id)}
          </span>
          {siblingIds.length > 0 && (
            <>
              <span className="text-mathe-muted">/</span>
              <span className="text-xs text-mathe-muted">
                {currentIndex + 1} de {siblingIds.length}
              </span>
            </>
          )}
        </nav>

        {/* Prev / Next */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => prevId && goTo(prevId)}
            disabled={prevId === null}
            className="flex items-center gap-1.5 rounded-pill border border-mathe-border bg-mathe-white px-3 py-1.5 text-xs font-semibold text-mathe-muted shadow-sm transition-colors hover:bg-mathe-surface disabled:opacity-40"
            aria-label="Pregunta anterior"
          >
            <ChevronLeft className="size-3.5" />
            Anterior
          </button>
          <button
            type="button"
            onClick={() => nextId && goTo(nextId)}
            disabled={nextId === null}
            className="flex items-center gap-1.5 rounded-pill border border-mathe-border bg-mathe-white px-3 py-1.5 text-xs font-semibold text-mathe-muted shadow-sm transition-colors hover:bg-mathe-surface disabled:opacity-40"
            aria-label="Pregunta siguiente"
          >
            Siguiente
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid gap-6 laptop:grid-cols-3">
        {/* ── Left: Question card (read-only) ── */}
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

            {/* Media */}
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

        {/* ── Right: Validation result panel ── */}
        <div className="laptop:col-span-1">
          <div className="sticky top-6 grid gap-4">
            {/* Status card */}
            <div className="rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm">
              <h3 className="mb-4 text-base font-bold text-mathe-ink">
                Resultado de validación
              </h3>

              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl p-4",
                  isApproved
                    ? "bg-emerald-50 ring-1 ring-emerald-200"
                    : "bg-rose-50 ring-1 ring-rose-200",
                )}
              >
                {isApproved ? (
                  <CheckCircle2 className="size-6 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="size-6 shrink-0 text-rose-600" />
                )}
                <div>
                  <p
                    className={cn(
                      "text-base font-bold",
                      isApproved ? "text-emerald-700" : "text-rose-700",
                    )}
                  >
                    {isApproved ? "Aprobada" : "Rechazada"}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      isApproved ? "text-emerald-600" : "text-rose-500",
                    )}
                  >
                    {isApproved
                      ? "Esta pregunta fue validada y puede aparecer en cuestionarios"
                      : "Esta pregunta fue descartada del banco de preguntas"}
                  </p>
                </div>
              </div>

              {/* Rejection reason */}
              {question.rejectionReason && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-amber-700">
                    Motivo de rechazo
                  </p>
                  <p className="text-sm leading-snug text-amber-800">
                    {question.rejectionReason}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-5 grid gap-3 border-t border-mathe-border pt-4">
                {[
                  {
                    label: "Generada el",
                    value: formatDate(question.generationDate),
                  },
                  {
                    label: "Estilo VAK",
                    value: toSpanishStyle(question.vakStyle),
                  },
                  { label: "Origen", value: question.origin },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-2"
                  >
                    <span className="text-xs text-mathe-muted">{label}</span>
                    <span className="text-right text-xs font-semibold text-mathe-ink">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation shortcuts */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => prevId && goTo(prevId)}
                disabled={prevId === null}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-mathe-border bg-mathe-white py-3 text-xs font-semibold text-mathe-muted shadow-sm transition-colors hover:bg-mathe-surface disabled:opacity-40"
              >
                <ArrowLeft className="size-3.5" />
                Anterior
              </button>
              <button
                type="button"
                onClick={() => nextId && goTo(nextId)}
                disabled={nextId === null}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-mathe-border bg-mathe-white py-3 text-xs font-semibold text-mathe-muted shadow-sm transition-colors hover:bg-mathe-surface disabled:opacity-40"
              >
                Siguiente
                <ArrowRight className="size-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate(ROUTING.DASHBOARD_VALIDATION_HISTORY)}
              className="flex items-center justify-center gap-2 rounded-xl border border-mathe-border bg-mathe-white py-2.5 text-sm font-semibold text-mathe-muted shadow-sm transition-colors hover:bg-mathe-surface"
            >
              <ArrowLeft className="size-4" />
              Volver al historial
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
