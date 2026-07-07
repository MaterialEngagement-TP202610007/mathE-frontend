export interface QuizOption {
  id: number
  text: string
  vakValue: "V" | "A" | "K"
}

export interface QuizQuestion {
  order: number
  questionId: number
  statement: string
  contentType: "text" | "image" | "audio"
  mediaUrl: string | null
  options: QuizOption[]
}

export interface QuestionnaireResponse {
  id: number
  studentId: number
  status: "in_progress" | "completed"
  startTime: string
  usedFallback: boolean
  createdAt: string
  updatedAt: string
  questions: QuizQuestion[]
}

export interface QuizAnswerRecord {
  selectedOptionId: number
}

/** Response from PATCH /questionnaires/:id/complete — a lean subset of the full QuizResult. */
export interface QuizCompletionResult {
  resultId: number
  predominantStyle: "Visual" | "Auditory" | "Kinesthetic"
  visualProbability: number
  auditoryProbability: number
  kinestheticProbability: number
  isMixedProfile: boolean
  classifierType: string
  aiFeedback: string | null
  feedbackSource: string | null
}

export interface QuizSession {
  questionnaireId: number
  studentId: number
  questions: QuizQuestion[]
  answers: Record<number, QuizAnswerRecord>
  currentIndex: number
  startTime: string
  status: "in_progress"
}
