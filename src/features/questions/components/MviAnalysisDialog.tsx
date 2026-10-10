import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  CloudOff,
  Info,
  ScanSearch,
  XCircle,
} from "lucide-react"
import type { ComponentType } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatDate } from "@/features/dashboard/utils"
import { cn } from "@/lib/utils"
import type {
  MviHistoryEntry,
  MviResult,
  MviRule,
  MviViolation,
} from "../interfaces/question.interface"
import {
  MVI_ATTEMPT_KIND_LABELS,
  getMviDiagnosis,
  getMviSummary,
  getRuleOutcome,
  getRulesCorrectedNext,
  sortViolations,
  type MviDiagnosis,
  type MviQuestionFields,
  type MviRuleOutcome,
} from "../utils/mvi"
import { getMviRuleCopy } from "../utils/mvi-rules"
import { MviStatusBadge } from "./MviStatusBadge"

const OPTION_LABELS = ["A", "B", "C", "D", "E"]

const VAK_LETTER_COLORS: Record<"V" | "A" | "K", string> = {
  V: "text-mathe-blue bg-blue-50 border-blue-100",
  A: "text-emerald-600 bg-emerald-50 border-emerald-100",
  K: "text-amber-600 bg-amber-50 border-amber-100",
}

const LEGACY_NOTE =
  "El detalle por intento no está disponible para preguntas creadas antes de esta función."

type RulesById = Map<string, MviRule>

// ── Small building blocks ─────────────────────────────────────────────────────

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-mathe-muted">
      {children}
    </h3>
  )
}

function Notice({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  children: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-mathe-border bg-mathe-surface p-4">
      <Icon className="mt-0.5 size-4 shrink-0 text-mathe-blue" />
      <p className="text-sm leading-snug text-mathe-ink">{children}</p>
    </div>
  )
}

function ViolationChip({
  violation,
  rules,
  corrected = false,
}: {
  violation: MviViolation
  rules: RulesById
  corrected?: boolean
}) {
  const isBlocking = violation.severity === "blocking"
  const { name } = getMviRuleCopy(violation.ruleId, rules.get(violation.ruleId))
  return (
    <li
      className={cn(
        "rounded-xl border p-3",
        isBlocking ? "border-red-200 bg-red-50/60" : "border-amber-200 bg-amber-50/60",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-bold",
            isBlocking ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800",
          )}
        >
          {isBlocking ? <XCircle className="size-3" /> : <AlertTriangle className="size-3" />}
          {isBlocking ? "Bloquea" : "Observación"}
        </span>
        <span className="text-sm font-semibold text-mathe-ink">{name}</span>
      </div>
      <p className="mt-1 text-xs leading-snug text-mathe-muted">{violation.message}</p>
      {corrected && (
        <p className="mt-2 inline-flex items-center gap-1 rounded-pill bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-mathe-success">
          <CheckCircle2 className="size-3" />
          Corregido en el intento siguiente
        </p>
      )}
    </li>
  )
}

function ViolationList({
  violations,
  rules,
  corrected,
}: {
  violations: MviViolation[]
  rules: RulesById
  corrected?: Set<string>
}) {
  if (violations.length === 0) {
    return (
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-mathe-success">
        <CheckCircle2 className="size-3.5" />
        Sin observaciones
      </p>
    )
  }
  return (
    <ul className="grid gap-2">
      {sortViolations(violations).map((v, i) => (
        <ViolationChip
          key={`${v.ruleId}-${i}`}
          violation={v}
          rules={rules}
          corrected={corrected?.has(v.ruleId)}
        />
      ))}
    </ul>
  )
}

// ── Timeline ──────────────────────────────────────────────────────────────────

function AttemptItem({
  entry,
  rules,
  corrected,
}: {
  entry: MviHistoryEntry
  rules: RulesById
  corrected: Set<string>
}) {
  return (
    <li className="relative pb-6 pl-7 last:pb-0">
      <span
        className={cn(
          "absolute -left-3 top-0 grid size-6 place-items-center rounded-full ring-4 ring-mathe-white",
          entry.approved ? "bg-emerald-50 text-mathe-success" : "bg-red-50 text-red-600",
        )}
      >
        {entry.approved ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
      </span>

      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-bold text-mathe-ink">
          Intento {entry.attempt} · {MVI_ATTEMPT_KIND_LABELS[entry.kind] ?? entry.kind}
        </p>
        <span
          className={cn(
            "rounded-pill px-2 py-0.5 text-[11px] font-semibold",
            entry.approved ? "bg-emerald-50 text-mathe-success" : "bg-red-50 text-red-700",
          )}
        >
          {entry.approved ? "Aprobado" : "Rechazado"}
        </span>
      </div>

      <p className="mt-2 rounded-xl border border-mathe-border bg-mathe-surface p-3 text-sm leading-snug text-mathe-ink">
        {entry.statement}
      </p>

      {entry.options.length > 0 && (
        <details className="group mt-2">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-pill text-xs font-semibold text-mathe-blue outline-none hover:underline focus-visible:ring-2 focus-visible:ring-mathe-blue/40 [&::-webkit-details-marker]:hidden">
            <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
            Ver opciones ({entry.options.length})
          </summary>
          <ul className="mt-2 grid gap-1.5">
            {entry.options.map((opt, idx) => (
              <li
                key={`${idx}-${opt.text}`}
                className="flex items-start gap-2 rounded-lg border border-mathe-border bg-mathe-white px-3 py-2"
              >
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-mathe-surface text-[10px] font-bold text-mathe-muted">
                  {OPTION_LABELS[idx] ?? idx + 1}
                </span>
                <span className="flex-1 text-xs text-mathe-ink">{opt.text}</span>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-bold",
                    VAK_LETTER_COLORS[opt.vakValue],
                  )}
                >
                  {opt.vakValue}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="mt-3">
        <ViolationList violations={entry.violations} rules={rules} corrected={corrected} />
      </div>
    </li>
  )
}

function AttemptTimeline({ history, rules }: { history: MviHistoryEntry[]; rules: RulesById }) {
  return (
    <section className="grid gap-3">
      <SectionTitle>Recorrido por intento</SectionTitle>
      <ol className="ml-3 border-l border-mathe-border">
        {history.map((entry, index) => (
          <AttemptItem
            key={`${entry.attempt}-${entry.validatedAt}`}
            entry={entry}
            rules={rules}
            corrected={getRulesCorrectedNext(history, index)}
          />
        ))}
      </ol>
    </section>
  )
}

// ── Checklist ─────────────────────────────────────────────────────────────────

const OUTCOMES: Record<
  MviRuleOutcome,
  { label: string; icon: ComponentType<{ className?: string }>; className: string }
> = {
  passed: { label: "Cumple", icon: CheckCircle2, className: "text-mathe-success" },
  warning: { label: "Observación", icon: AlertTriangle, className: "text-amber-600" },
  blocking: { label: "Bloquea", icon: XCircle, className: "text-red-600" },
}

function CriteriaChecklist({
  rules,
  violations,
}: {
  rules: MviRule[]
  violations: MviViolation[]
}) {
  const items = rules.map((rule) => ({
    rule,
    copy: getMviRuleCopy(rule.id, rule),
    outcome: getRuleOutcome(rule.id, violations),
  }))
  const passedCount = items.filter((i) => i.outcome === "passed").length
  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <SectionTitle>Criterios evaluados</SectionTitle>
        <span className="text-xs font-semibold text-mathe-muted">
          {passedCount} de {items.length} cumplidos
        </span>
      </div>
      <ul className="grid gap-2">
        {items.map(({ rule, copy, outcome }) => {
          const { label, icon: Icon, className } = OUTCOMES[outcome]
          return (
            <li
              key={rule.id}
              className="flex items-start gap-3 rounded-xl border border-mathe-border bg-mathe-white p-3"
            >
              <Icon className={cn("mt-0.5 size-4 shrink-0", className)} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-mathe-ink">{copy.name}</p>
                {copy.why && (
                  <p className="mt-0.5 text-xs leading-snug text-mathe-muted">
                    Por qué importa: {copy.why}
                  </p>
                )}
              </div>
              <span className={cn("shrink-0 text-[11px] font-semibold", className)}>{label}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// ── Body ──────────────────────────────────────────────────────────────────────

function DiagnosisBody({ result }: { result: MviResult }) {
  const rules: RulesById = new Map((result.rules ?? []).map((r) => [r.id, r]))
  const history = result.history ?? []
  const hasHistory = history.length > 0
  const finalViolations = hasHistory ? history[history.length - 1].violations : result.violations

  return (
    <>
      {hasHistory ? (
        <AttemptTimeline history={history} rules={rules} />
      ) : (
        <section className="grid gap-3">
          <SectionTitle>Observaciones finales</SectionTitle>
          <ViolationList violations={result.violations} rules={rules} />
          <Notice icon={Info}>{LEGACY_NOTE}</Notice>
        </section>
      )}
      {result.rules && result.rules.length > 0 && (
        <CriteriaChecklist rules={result.rules} violations={finalViolations} />
      )}
    </>
  )
}

function getStatusExplanation(diagnosis: MviDiagnosis): {
  icon: ComponentType<{ className?: string }>
  text: string
} | null {
  if (diagnosis.status === "unavailable") {
    return { icon: CloudOff, text: "El motor no respondió cuando se generó esta pregunta." }
  }
  if (diagnosis.status === null || diagnosis.status === "skipped") {
    return { icon: CircleDashed, text: "Esta pregunta no pasó por el motor de validación." }
  }
  if (!diagnosis.result) {
    return { icon: Info, text: "El detalle del análisis no está disponible para esta pregunta." }
  }
  return null
}

function formatCatalogFooter({ catalogVersion, validatedAt }: MviDiagnosis): string | null {
  const parts: string[] = []
  if (catalogVersion) parts.push(`Catálogo v${catalogVersion.replace(/^v/i, "")}`)
  if (validatedAt && !Number.isNaN(Date.parse(validatedAt))) parts.push(formatDate(validatedAt))
  return parts.length > 0 ? parts.join(" · ") : null
}

// ── Dialog ────────────────────────────────────────────────────────────────────

interface MviAnalysisDialogProps {
  question: MviQuestionFields
  /** Extra classes for the trigger button. */
  triggerClassName?: string
}

/**
 * "Ver análisis del motor" button that opens the MVI diagnosis of a question:
 * summary, per-attempt timeline, evaluated criteria and catalog footer.
 * Teacher/admin pages only.
 */
export function MviAnalysisDialog({ question, triggerClassName }: MviAnalysisDialogProps) {
  const diagnosis = getMviDiagnosis(question)
  const explanation = getStatusExplanation(diagnosis)
  // Only passed/failed diagnoses with a result get the detailed view.
  const result = explanation ? null : diagnosis.result
  const footer = formatCatalogFooter(diagnosis)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-pill border border-mathe-blue/30 bg-mathe-white px-5 text-sm font-semibold text-mathe-blue transition-colors hover:border-mathe-blue/50 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mathe-blue/40",
            triggerClassName,
          )}
        >
          <ScanSearch className="size-4" />
          Ver análisis del motor
        </button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="gap-3 border-b border-mathe-border p-6 pr-12 text-left sm:text-left">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-mathe-blue">
              <ScanSearch className="size-5" />
            </span>
            <DialogTitle className="text-lg leading-tight tablet:text-xl">
              Análisis del motor de validación
            </DialogTitle>
          </div>
          <MviStatusBadge status={diagnosis.status} className="w-fit" />
          <DialogDescription className="leading-snug">
            {result
              ? getMviSummary(result)
              : "Revisión automática de la redacción de esta pregunta."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
          {result ? (
            <DiagnosisBody result={result} />
          ) : (
            explanation && <Notice icon={explanation.icon}>{explanation.text}</Notice>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-mathe-border px-6 py-4 tablet:flex-row tablet:items-center tablet:justify-between">
          <p className="text-xs text-mathe-muted">{footer ?? "Catálogo no informado"}</p>
          <DialogClose asChild>
            <button
              type="button"
              className="min-h-11 rounded-pill bg-mathe-blue px-6 text-sm font-semibold text-mathe-white transition-colors hover:bg-mathe-blue-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mathe-blue/40"
            >
              Entendido
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
