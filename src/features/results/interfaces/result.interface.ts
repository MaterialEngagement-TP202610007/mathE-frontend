export type VakStyleApi = "Visual" | "Auditory" | "Kinesthetic"
export type ProfileType = "dominant" | "mixed"
export type ClassifierType = "simple_score" | "xgboost"
export type FeedbackSource = "gemini" | "fallback"

export interface QuizResult {
  id: number
  questionnaireId: number
  studentId: number
  mlModelId: number | null
  predominantStyle: VakStyleApi
  secondaryStyle: VakStyleApi | null
  visualProbability: number
  auditoryProbability: number
  kinestheticProbability: number
  predominantConfidence: number
  profileType: ProfileType
  isMixedProfile: boolean
  classifierType: ClassifierType
  modelVersion: string | null
  aiFeedback: string | null
  feedbackSource: FeedbackSource | null
  createdAt: string
  updatedAt: string
}
