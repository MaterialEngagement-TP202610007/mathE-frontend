import { ENDPOINT_SERVER } from "@/config/constant.config"
import { api } from "@/lib/http"
import type { PaginatedResponse } from "@/shared/interfaces/pagination.interface"
import type { QuestionnaireResponse } from "../interfaces/questionnaire.interface"
import type { QuizResult } from "@/features/results/interfaces/result.interface"

export interface SubmitAnswerItem {
  questionId: number
  selectedOptionId: number | null
  questionTimeSeconds: number
  numberOfChanges: number
  timesReviewed: number
}

export interface SubmitPayload {
  completionPercentage: number
  answers: SubmitAnswerItem[]
}

export interface AnswerRecord {
  id: number
  questionnaireId: number
  questionId: number
  selectedOptionId: number | null
  navigationSequence: number | null
  questionTimeSeconds: number
  numberOfChanges: number
  numberOfClicks: number
  timesReviewed: number
  createdAt: string
}

export interface SubmitAnswerPayload {
  questionId: number
  selectedOptionId?: number | null
  navigationSequence?: number
  questionTimeSeconds?: number
  numberOfChanges?: number
  numberOfClicks?: number
  timesReviewed?: number
}

export const questionnaireService = {
  create: async (): Promise<QuestionnaireResponse> => {
    const { data } = await api.post<QuestionnaireResponse>(ENDPOINT_SERVER.QUESTIONNAIRES)
    return data
  },

  getActive: async (): Promise<QuestionnaireResponse> => {
    const { data } = await api.get<QuestionnaireResponse>(ENDPOINT_SERVER.QUESTIONNAIRES_ACTIVE)
    return data
  },

  listMy: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<QuestionnaireResponse>> => {
    const { data } = await api.get<PaginatedResponse<QuestionnaireResponse>>(
      ENDPOINT_SERVER.QUESTIONNAIRES,
      { params },
    )
    return data
  },

  getById: async (id: number): Promise<QuestionnaireResponse> => {
    const { data } = await api.get<QuestionnaireResponse>(`${ENDPOINT_SERVER.QUESTIONNAIRES}/${id}`)
    return data
  },

  submit: async (id: number, payload: SubmitPayload): Promise<QuizResult> => {
    const { data } = await api.patch<QuizResult>(
      `${ENDPOINT_SERVER.QUESTIONNAIRES}/${id}/complete`,
      payload,
    )
    return data
  },

  abandon: async (id: number): Promise<void> => {
    await api.patch(`${ENDPOINT_SERVER.QUESTIONNAIRES}/${id}/abandon`)
  },

  submitAnswer: async (questionnaireId: number, payload: SubmitAnswerPayload): Promise<AnswerRecord> => {
    const { data } = await api.post<AnswerRecord>(
      `${ENDPOINT_SERVER.QUESTIONNAIRES}/${questionnaireId}/answers`,
      payload,
    )
    return data
  },

  listAnswers: async (
    questionnaireId: number,
    params?: { page?: number; limit?: number },
  ): Promise<PaginatedResponse<AnswerRecord>> => {
    const { data } = await api.get<PaginatedResponse<AnswerRecord>>(
      `${ENDPOINT_SERVER.QUESTIONNAIRES}/${questionnaireId}/answers`,
      { params },
    )
    return data
  },

  getAnswerById: async (questionnaireId: number, answerId: number): Promise<AnswerRecord> => {
    const { data } = await api.get<AnswerRecord>(
      `${ENDPOINT_SERVER.QUESTIONNAIRES}/${questionnaireId}/answers/${answerId}`,
    )
    return data
  },
}
