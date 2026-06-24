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

export interface UserResultStats {
  userId: number
  total: number
  predominantStyle: VakStyleApi | null
  profile: "Estable" | "Variable" | null
}

export interface EvolutionDataPoint {
  period: string
  predominantStyle: VakStyleApi
  avgVisualProbability: number
  avgAuditoryProbability: number
  avgKinestheticProbability: number
  count: number
}

export interface UserEvolutionResult {
  studentId: number
  from: string
  to: string
  granularity: "day" | "month" | "year"
  totalEvaluations: number
  dataPoints: EvolutionDataPoint[]
}
