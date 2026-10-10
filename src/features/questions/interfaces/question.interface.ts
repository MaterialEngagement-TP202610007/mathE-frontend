export type VakStyleApi = "Visual" | "Auditory" | "Kinesthetic"
export type QuestionStatus = "pending" | "approved" | "rejected"

export interface QuestionOption {
  id: number
  questionId: number
  text: string
  vakValue: "V" | "A" | "K"
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// ── MVI (item validation engine) diagnosis ───────────────────────────────────
// Teacher/admin only. All fields are optional on `Question` because the
// production backend may not send them yet: treat missing as `null`/`false`.

export type MviStatus = "passed" | "failed" | "unavailable" | "skipped"
export type MviSeverity = "blocking" | "warning"
export type MviAttemptKind = "generation" | "revision" | "revalidation"

export interface MviViolation {
  ruleId: string
  message: string
  measuredValue: unknown
  threshold: unknown
  severity: MviSeverity
}

export interface MviHistoryEntry {
  /** 1-based position in history. */
  attempt: number
  kind: MviAttemptKind
  statement: string
  options: { text: string; vakValue: "V" | "A" | "K" }[]
  approved: boolean
  violations: MviViolation[]
  validatedAt: string
}

export interface MviRule {
  id: string
  /** MVI's own wording (Spanish). Used as name fallback for unknown rule ids. */
  description: string
  threshold: number | null
  severity: MviSeverity
}

export interface MviResult {
  approved: boolean
  /** Generation-loop iterations, including malformed drafts that never reached MVI. */
  attempts: number
  /** Violations of the saved text. */
  violations: MviViolation[]
  /** One entry per MVI call, oldest first. Absent on older questions. */
  history?: MviHistoryEntry[]
  /** Catalog snapshot for the latest diagnosis. Absent on older questions. */
  rules?: MviRule[]
}

export interface Question {
  id: number
  statement: string
  contentType: "text" | "image" | "audio"
  mediaUrl: string | null
  vakStyle: VakStyleApi
  validationStatus: QuestionStatus
  origin: string
  generationDate: string
  teacherId: number | null
  rejectionReason: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  options: QuestionOption[]
  mviStatus?: MviStatus | null
  mviResult?: MviResult | null
  mviCatalogVersion?: string | null
  mviValidatedAt?: string | null
  /** True when a teacher approved the question while `mviStatus` was "failed". */
  approvedOverMvi?: boolean
}

export interface GenerateBatchPayload {
  count: number
  vakStyle: VakStyleApi
  teacherId?: number | null
}

export interface GenerateBatchResponse {
  message: string
  vakStyle: string
  count: number
}

export interface RejectQuestionPayload {
  rejectionReason: string
}

export interface ListQuestionsParams {
  status?: QuestionStatus
  vakStyle?: VakStyleApi
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}

export interface ValidatedHistoryParams {
  vakStyle?: VakStyleApi
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}
