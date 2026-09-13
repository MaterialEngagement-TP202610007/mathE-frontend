export type VakStyleApi = "Visual" | "Auditory" | "Kinesthetic"
/** Confidence band of the predominant style, as computed by the classifier. */
export type ProfileType = "clear" | "tendency" | "mixed"
export type ClassifierType = "simple_score" | "xgboost"
/** `predefined` = static feedback used when Gemini is unavailable. */
export type FeedbackSource = "gemini" | "predefined"

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
  profileType: ProfileType | null
  isMixedProfile: boolean
  classifierType: ClassifierType
  modelVersion: string | null
  aiFeedback: string | null
  feedbackSource: FeedbackSource | null
  createdAt: string
  updatedAt: string
}
