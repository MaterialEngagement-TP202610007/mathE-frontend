import type {
  MviAttemptKind,
  MviHistoryEntry,
  MviResult,
  MviStatus,
  MviViolation,
  Question,
} from "../interfaces/question.interface"

/** MVI fields of a question, as consumed by the MVI UI. */
export type MviQuestionFields = Pick<
  Question,
  "statement" | "mviStatus" | "mviResult" | "mviCatalogVersion" | "mviValidatedAt" | "approvedOverMvi"
>

/** MVI fields with every optional value resolved (missing → `null` / `false`). */
export interface MviDiagnosis {
  status: MviStatus | null
  result: MviResult | null
  catalogVersion: string | null
  validatedAt: string | null
  approvedOverMvi: boolean
}

/** Resolves the optional MVI fields; the production backend may not send them yet. */
export function getMviDiagnosis(question: MviQuestionFields): MviDiagnosis {
  return {
    status: question.mviStatus ?? null,
    result: question.mviResult ?? null,
    catalogVersion: question.mviCatalogVersion ?? null,
    validatedAt: question.mviValidatedAt ?? null,
    approvedOverMvi: question.approvedOverMvi ?? false,
  }
}

export const MVI_ATTEMPT_KIND_LABELS: Record<MviAttemptKind, string> = {
  generation: "Generación",
  revision: "Corrección",
  revalidation: "Revalidación",
}

/** Outcome of a single rule in one attempt. */
export type MviRuleOutcome = "passed" | "warning" | "blocking"

/**
 * A rule failed when any violation with its id exists. Blocking wins over warning
 * when the same rule reports both.
 */
export function getRuleOutcome(ruleId: string, violations: MviViolation[]): MviRuleOutcome {
  let outcome: MviRuleOutcome = "passed"
  for (const v of violations) {
    if (v.ruleId !== ruleId) continue
    if (v.severity === "blocking") return "blocking"
    outcome = "warning"
  }
  return outcome
}

/** Blocking violations first, keeping the backend order inside each group. */
export function sortViolations(violations: MviViolation[]): MviViolation[] {
  return [...violations].sort(
    (a, b) => Number(b.severity === "blocking") - Number(a.severity === "blocking"),
  )
}

/**
 * Rule ids that failed in `history[index]` and have no violation in the next entry.
 * Only a `revision` rewrites the text: a rule disappearing on a `revalidation` means the
 * catalog changed, not that the text was corrected. The last entry never has corrections.
 */
export function getRulesCorrectedNext(history: MviHistoryEntry[], index: number): Set<string> {
  const next = history[index + 1]
  if (!next || next.kind !== "revision") return new Set()
  const stillFailing = new Set(next.violations.map((v) => v.ruleId))
  return new Set(
    history[index].violations.map((v) => v.ruleId).filter((id) => !stillFailing.has(id)),
  )
}

/**
 * Index of the latest history entry whose statement matches the saved question text,
 * or -1 when none matches (e.g. the statement was edited after validation).
 */
export function getSavedAttemptIndex(history: MviHistoryEntry[], savedStatement: string): number {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].statement === savedStatement) return i
  }
  return -1
}

/** "El motor revisó esta pregunta en N intento(s) y …". */
export function getMviSummary(result: MviResult): string {
  const attempts = Math.max(result.attempts, 1)
  const noun = attempts === 1 ? "intento" : "intentos"
  const verdict = result.approved ? "la aprobó" : "encontró observaciones"
  return `El motor revisó esta pregunta en ${attempts} ${noun} y ${verdict}.`
}
