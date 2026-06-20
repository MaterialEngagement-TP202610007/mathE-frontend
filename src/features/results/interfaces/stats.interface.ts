import type { VakStyleApi } from "@/features/questions/interfaces/question.interface"

export interface SchoolStats {
  evaluatedStudents: number
  mostCommonStyle: VakStyleApi | null
  avgPredominantConfidence: number
}

export interface GradeStats {
  gradeId: number
  gradeName?: string
  level: "Primaria" | "Secundaria"
  avgVisualProbability: number
  avgAuditoryProbability: number
  avgKinestheticProbability: number
}
