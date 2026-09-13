import { ENDPOINT_SERVER } from "@/config/constant.config"
import { api } from "@/lib/http"
import type { PaginatedResponse } from "@/shared/interfaces/pagination.interface"
import type {
  Question,
  GenerateBatchPayload,
  GenerateBatchResponse,
  RejectQuestionPayload,
  ListQuestionsParams,
  ValidatedHistoryParams,
} from "../interfaces/question.interface"

export const questionService = {
  generateBatch: async ({ count, vakStyle, teacherId }: GenerateBatchPayload): Promise<GenerateBatchResponse> => {
    const { data } = await api.post<GenerateBatchResponse>(
      `${ENDPOINT_SERVER.QUESTIONS}/generate`,
      { vakStyle, teacherId },
      { params: { count } },
    )
    return data
  },

  listMy: async (params?: ListQuestionsParams): Promise<PaginatedResponse<Question>> => {
    const { data } = await api.get<PaginatedResponse<Question>>(ENDPOINT_SERVER.QUESTIONS_MY, { params })
    return data
  },

  listValidatedHistory: async (params?: ValidatedHistoryParams): Promise<PaginatedResponse<Question>> => {
    const { data } = await api.get<PaginatedResponse<Question>>(
      ENDPOINT_SERVER.QUESTIONS_VALIDATED_HISTORY,
      { params },
    )
    return data
  },

  getById: async (id: number): Promise<Question> => {
    const { data } = await api.get<Question>(`${ENDPOINT_SERVER.QUESTIONS}/${id}`)
    return data
  },

  approve: async (id: number): Promise<Question> => {
    const { data } = await api.patch<Question>(`${ENDPOINT_SERVER.QUESTIONS}/${id}/approve`)
    return data
  },

  reject: async (id: number, payload: RejectQuestionPayload): Promise<Question> => {
    const { data } = await api.patch<Question>(`${ENDPOINT_SERVER.QUESTIONS}/${id}/reject`, payload)
    return data
  },
}
