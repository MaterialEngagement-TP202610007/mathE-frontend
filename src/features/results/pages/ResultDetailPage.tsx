import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"
import {
  Activity,
  ArrowLeft,
  Bot,
  Calendar,
  Cpu,
  Download,
  Eye,
  Headphones, 
  Loader2,
  Sparkles,
} from "lucide-react"
import { motion } from "motion/react"
import { Label, Pie, PieChart } from "recharts"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { VakBadge } from "@/features/dashboard/components/VakBadge"
import { resultService } from "../services/result.service"
import { toDisplayStyle, VAK_COLORS } from "../utils/vak"
import type { QuizResult, VakStyleApi } from "../interfaces/result.interface"

// ── Static lookup tables ──────────────────────────────────────────────────────

const VAK_HEX: Record<VakStyleApi, string> = {
  Visual: "#0056D2",
  Auditory: "#10b981",
  Kinesthetic: "#f59e0b",
}

const STYLE_ICON_BG: Record<VakStyleApi, string> = {
  Visual: "bg-blue-50 text-mathe-blue",
  Auditory: "bg-emerald-50 text-emerald-600",
  Kinesthetic: "bg-amber-50 text-amber-600",
}

const STYLE_ICON: Record<VakStyleApi, React.ElementType> = {
  Visual: Eye,
  Auditory: Headphones,
  Kinesthetic: Activity,
}

const STYLE_DESCRIPTIONS: Record<VakStyleApi, string> = {
  Visual:
    "El estilo Visual implica procesar y retener información principalmente a través de imágenes, diagramas y esquemas. Las personas con este estilo recuerdan mejor lo que ven y tienden a pensar en imágenes. Prefieren la información presentada de forma gráfica, organizada espacialmente y con uso de colores. Son buenos para interpretar mapas, tablas y gráficas.",
  Auditory:
    "El estilo Auditivo implica procesar y retener información principalmente a través del sonido y el lenguaje. Las personas con este estilo recuerdan mejor lo que escuchan y aprenden mediante conversaciones, debates y explicaciones verbales. Responden bien a instrucciones orales y disfrutan de los debates en clase.",
  Kinesthetic:
    "El estilo Kinestésico implica procesar y retener información a través de la experiencia física y el movimiento. Las personas con este estilo aprenden mejor haciendo, tocando y experimentando directamente con los materiales. Prefieren las actividades prácticas y el aprendizaje en movimiento.",
}

const CLASSIFIER_LABELS: Record<string, string> = {
  simple_score: "Clasificador de puntaje (fase piloto)",
  xgboost: "Modelo XGBoost",
}

const STYLES: VakStyleApi[] = ["Visual", "Auditory", "Kinesthetic"]

// ── Helpers ───────────────────────────────────────────────────────────────────

function getProb(result: QuizResult, style: VakStyleApi): number {
  if (style === "Visual") return result.visualProbability
  if (style === "Auditory") return result.auditoryProbability
  return result.kinestheticProbability
}

// ── Motion variants ───────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 28 },
  },
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-mathe-muted">{icon}</span>
      <div>
        <p className="text-xs text-mathe-muted">{label}</p>
        <p className="text-sm font-medium text-mathe-ink">{value}</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ResultDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const reportRef = useRef<HTMLDivElement>(null)

  const [result, setResult] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    resultService
      .getById(Number(id))
      .then(setResult)
      .catch(() => navigate("/dashboard", { replace: true }))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleExport = async () => {
    if (!reportRef.current || !result) return
    setExporting(true)
    try {
      await document.fonts.ready

      const [html2canvasModule, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ])
      const html2canvas =
        (html2canvasModule.default as typeof html2canvasModule.default | undefined) ??
        (html2canvasModule as unknown as typeof html2canvasModule.default)

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        allowTaint: true,
        useCORS: false,
        logging: false,
        backgroundColor: "#ffffff",
        removeContainer: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const margin = 12
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const usableW = pageW - margin * 2
      const usableH = pageH - margin * 2
      const imgH = (canvas.height * usableW) / canvas.width

      if (imgH <= usableH) {
        pdf.addImage(imgData, "PNG", margin, margin, usableW, imgH)
      } else {
        const totalPages = Math.ceil(imgH / usableH)
        for (let p = 0; p < totalPages; p++) {
          if (p > 0) pdf.addPage()
          pdf.addImage(imgData, "PNG", margin, margin - p * usableH, usableW, imgH)
        }
      }

      pdf.save(`informe-vak-${result.id}.pdf`)
    } catch (err) {
      console.error("[PDF export]", err)
      toast.error("No se pudo exportar el PDF. Intenta de nuevo.")
    } finally {
      setExporting(false)
    }
  }

  // ── Guards ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="size-8 animate-spin rounded-full border-4 border-mathe-border border-t-mathe-blue" />
      </div>
    )
  }

  if (!result) return null

  // ── Derived values ────────────────────────────────────────────────────────

  const displayStyle = toDisplayStyle(result.predominantStyle)
  const secondaryDisplay = result.secondaryStyle
    ? toDisplayStyle(result.secondaryStyle)
    : null
  const IconComponent = STYLE_ICON[result.predominantStyle]
  const iconBg = STYLE_ICON_BG[result.predominantStyle]

  const date = new Date(result.createdAt).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  // ChartContainer injects --color-Visual / --color-Auditory / --color-Kinesthetic
  const chartConfig = {
    value: { label: "Probabilidad" },
    Visual: { label: "Visual", color: VAK_HEX.Visual },
    Auditory: { label: "Auditivo", color: VAK_HEX.Auditory },
    Kinesthetic: { label: "Kinestésico", color: VAK_HEX.Kinesthetic },
  } satisfies ChartConfig

  const pieData = STYLES.map((s) => ({
    vakStyle: s,
    label: chartConfig[s].label,
    value: getProb(result, s),
    fill: `var(--color-${s})`,
  }))

  return (
    <div className="grid gap-6 pb-10">
      {/* ── Toolbar (not captured in PDF) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-9 items-center gap-1.5 rounded-pill border border-mathe-border bg-mathe-white px-4 text-sm font-semibold text-mathe-muted transition-colors hover:bg-mathe-surface hover:text-mathe-ink"
          >
            <ArrowLeft className="size-4" />
            Volver
          </button>
          <span className="flex items-center gap-1.5 text-sm text-mathe-muted">
            <Calendar className="size-4 shrink-0" />
            {date}
          </span>
          <VakBadge style={displayStyle} />
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex h-9 items-center gap-2 rounded-pill border border-mathe-border bg-mathe-white px-4 text-sm font-semibold text-mathe-muted transition-colors hover:bg-mathe-surface hover:text-mathe-ink disabled:pointer-events-none disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Exportar resultado
        </button>
      </div>

      <h1 className="text-3xl font-bold text-mathe-ink">Informe detallado de resultado</h1>

      {/* ── PDF-captured region ── */}
      <div ref={reportRef} className="grid gap-5">
        <motion.div className="grid gap-5" initial="hidden" animate="show" variants={stagger}>

          {/* ── Hero card ── */}
          <motion.div
            variants={cardVariant}
            className="rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-5 tablet:flex-row tablet:items-center">
              <span className={cn("grid size-16 shrink-0 place-items-center rounded-2xl", iconBg)}>
                <IconComponent className="size-8" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-mathe-muted">
                  Estilo predominante
                </p>
                <p className="mt-1 text-3xl font-bold text-mathe-blue">
                  {displayStyle}
                  <span className="ml-2 text-2xl font-semibold text-mathe-blue/60">
                    — {result.predominantConfidence}%
                  </span>
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-mathe-muted">
              {STYLE_DESCRIPTIONS[result.predominantStyle]}
            </p>
          </motion.div>

          {/* ── Distribution card ── */}
          <motion.div
            variants={cardVariant}
            className="rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm"
          >
            <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-mathe-muted">
              Distribución de estilos
            </p>

            <div className="flex flex-col gap-8 laptop:flex-row laptop:items-center">
              {/* Donut + legend */}
              <div className="flex shrink-0 flex-col items-center gap-6 tablet:flex-row laptop:flex-col">
                {/* Donut via shadcn ChartContainer */}
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square w-[200px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel={false} />}
                    />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="vakStyle"
                      innerRadius={58}
                      outerRadius={88}
                      strokeWidth={3}
                      stroke="#ffffff"
                      startAngle={90}
                      endAngle={-270}
                      isAnimationActive
                      animationBegin={300}
                      animationDuration={900}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (!viewBox || !("cx" in viewBox)) return null
                          const { cx, cy } = viewBox as { cx: number; cy: number }
                          return (
                            <text
                              x={cx}
                              y={cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={cx}
                                y={cy - 6}
                                style={{ fontSize: "1.35rem", fontWeight: 700, fill: "#1f1f1f" }}
                              >
                                {result.predominantConfidence}%
                              </tspan>
                              <tspan
                                x={cx}
                                y={cy + 14}
                                style={{ fontSize: "0.7rem", fill: "#6b7280" }}
                              >
                                confianza
                              </tspan>
                            </text>
                          )
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>

                {/* Legend */}
                {/* <div className="flex flex-col gap-3">
                  {pieData.map((entry) => {
                    const hex = VAK_HEX[entry.vakStyle]
                    return (
                      <div key={entry.vakStyle} className="flex items-center gap-2.5">
                        <span
                          className="size-3 shrink-0 rounded-sm"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="min-w-[5.5rem] text-sm text-mathe-ink">
                          {entry.label}
                        </span>
                        <span className="text-sm font-bold" style={{ color: hex }}>
                          {entry.value}%
                        </span>
                      </div>
                    )
                  })}
                </div> */}
              </div>

              {/* Animated progress bars */}
              <div className="flex flex-1 flex-col gap-5">
                {STYLES.map((style, idx) => {
                  const pct = getProb(result, style)
                  const { text } = VAK_COLORS[style]
                  const hex = VAK_HEX[style]
                  return (
                    <div key={style}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className={cn("text-sm font-semibold", text)}>
                          {toDisplayStyle(style)}
                        </span>
                        <span className={cn("text-sm font-bold tabular-nums", text)}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-mathe-border">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: hex }}
                          initial={{ width: "0%" }}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            duration: 0.85,
                            delay: 0.5 + idx * 0.15,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* ── Mixed profile card ── */}
          {result.isMixedProfile && result.secondaryStyle && secondaryDisplay && (
            <motion.div
              variants={cardVariant}
              className="rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-mathe-muted">
                Perfil mixto
              </p>
              <p className="mt-2 text-sm leading-relaxed text-mathe-muted">
                Tu perfil predominante es{" "}
                <span className="font-semibold text-mathe-ink">{displayStyle}</span> con
                componentes secundarios relevantes:
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <VakBadge style={displayStyle} />
                <VakBadge style={secondaryDisplay} />
              </div>
            </motion.div>
          )}

          {/* ── AI feedback card ── */}
          {result.aiFeedback && (
            <motion.div
              variants={cardVariant}
              className="rounded-2xl border border-mathe-border bg-mathe-white p-6 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-mathe-muted">
                  Retroalimentación personalizada
                </p>
                {result.feedbackSource === "gemini" && (
                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-600">
                    <Sparkles className="size-3" />
                    Gemini AI
                  </span>
                )}
                {result.feedbackSource === "fallback" && (
                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-mathe-surface px-2.5 py-1 text-xs font-semibold text-mathe-muted">
                    <Bot className="size-3" />
                    Respuesta estándar
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-mathe-ink">{result.aiFeedback}</p>
            </motion.div>
          )}

          {/* ── Metadata card ── */}
          <motion.div
            variants={cardVariant}
            className="flex flex-wrap gap-x-8 gap-y-4 rounded-2xl border border-mathe-border bg-mathe-white px-6 py-5 shadow-sm"
          >
            <MetaItem
              icon={<Cpu className="size-3.5" />}
              label="Clasificador"
              value={CLASSIFIER_LABELS[result.classifierType] ?? result.classifierType}
            />
            {result.modelVersion && (
              <MetaItem
                icon={<Bot className="size-3.5" />}
                label="Versión del modelo"
                value={result.modelVersion}
              />
            )}
            {result.feedbackSource && (
              <MetaItem
                icon={<Sparkles className="size-3.5" />}
                label="Fuente de retroalimentación"
                value={
                  result.feedbackSource === "gemini"
                    ? "Google Gemini"
                    : "Respuesta de reserva"
                }
              />
            )}
            <MetaItem
              icon={<Calendar className="size-3.5" />}
              label="ID del cuestionario"
              value={`#${result.questionnaireId}`}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
