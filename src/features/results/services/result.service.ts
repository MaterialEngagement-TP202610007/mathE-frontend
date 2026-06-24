import { ENDPOINT_SERVER } from "@/config/constant.config"
import { api } from "@/lib/http"
import type { PaginatedResponse } from "@/shared/interfaces/pagination.interface"
import type { QuizResult, VakStyleApi } from "../interfaces/result.interface"
import type { SchoolStats, GradeStats, UserResultStats, UserEvolutionResult } from "../interfaces/stats.interface"

export interface ListResultsParams {
  page?: number
  limit?: number
  studentId?: number
  gradeId?: number
  schoolId?: number
  classifierType?: string
}

export interface MyResultsParams {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  predominantStyle?: VakStyleApi
}

export const resultService = {
  listAll: async (params?: ListResultsParams): Promise<PaginatedResponse<QuizResult>> => {
    const { data } = await api.get<PaginatedResponse<QuizResult>>(ENDPOINT_SERVER.RESULTS, { params })
    return data
  },

  getMy: async (params?: MyResultsParams): Promise<PaginatedResponse<QuizResult>> => {
    const { data } = await api.get<PaginatedResponse<QuizResult>>(ENDPOINT_SERVER.RESULTS_MY, {
      params: { page: 1, limit: 10, ...params },
    })
    return data
  },

  getByQuestionnaire: async (questionnaireId: number): Promise<QuizResult> => {
    const { data } = await api.get<QuizResult>(
      `${ENDPOINT_SERVER.RESULTS}/questionnaire/${questionnaireId}`,
    )
    return data
  },

  getById: async (id: number): Promise<QuizResult> => {
    const { data } = await api.get<QuizResult>(`${ENDPOINT_SERVER.RESULTS}/${id}`)
    return data
  },

  correctLabel: async (id: number, vakLabel: VakStyleApi): Promise<QuizResult> => {
    const { data } = await api.patch<QuizResult>(
      `${ENDPOINT_SERVER.RESULTS}/${id}/correct-label`,
      { vakLabel },
    )
    return data
  },

  getSchoolStats: async (schoolId: number): Promise<SchoolStats> => {
    const { data } = await api.get<SchoolStats>(
      `${ENDPOINT_SERVER.RESULTS_STATS_SCHOOL}/${schoolId}`,
    )
    return data
  },

  getSchoolStatsByGrade: async (
    schoolId: number,
    level: "Primaria" | "Secundaria",
  ): Promise<GradeStats[]> => {
    const { data } = await api.get<GradeStats[]>(
      `${ENDPOINT_SERVER.RESULTS_STATS_SCHOOL}/${schoolId}/by-grade`,
      { params: { level } },
    )
    return data
  },

  getUserStats: async (userId: number): Promise<UserResultStats> => {
    const { data } = await api.get<UserResultStats>(
      `${ENDPOINT_SERVER.RESULTS_STATS_USER}/${userId}`,
    )
    return data
  },

  getEvolution: async (
    studentId: number,
    params?: { granularity?: "day" | "month" | "year"; from?: string; to?: string },
  ): Promise<UserEvolutionResult> => {
    const { data } = await api.get<UserEvolutionResult>(
      `${ENDPOINT_SERVER.RESULTS_EVOLUTION}/${studentId}`,
      { params },
    )
    return data
  },

  listByStudent: async (
    studentId: number,
    params?: {
      page?: number
      limit?: number
      startDate?: string
      endDate?: string
      predominantStyle?: VakStyleApi
      classifierType?: string
    },
  ): Promise<PaginatedResponse<QuizResult>> => {
    const { data } = await api.get<PaginatedResponse<QuizResult>>(
      `${ENDPOINT_SERVER.RESULTS_STUDENT}/${studentId}`,
      { params },
    )
    return data
  },
}
