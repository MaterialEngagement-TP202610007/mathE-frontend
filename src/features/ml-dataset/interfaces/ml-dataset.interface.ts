export type LabelSource = "simple_score" | "teacher_validated"
export type VakStyleApi = "Visual" | "Auditory" | "Kinesthetic"

export interface MlDatasetEntry {
  id: number
  questionnaireId: number
  studentId: number
  vakLabel: VakStyleApi
  labelSource: LabelSource
  correctedLabel: VakStyleApi | null
  includedInTraining: boolean
  visualScore: number
  auditoryScore: number
  kinestheticScore: number
  totalTimeSeconds: number
  totalChanges: number
  totalClicks: number
  totalReviews: number
  createdAt: string
  updatedAt: string
}

export interface ListDatasetParams {
  page?: number
  limit?: number
  studentId?: number
  gradeId?: number
  schoolId?: number
  labelSource?: LabelSource
  includedInTraining?: boolean
}
