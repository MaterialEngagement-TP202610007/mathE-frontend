import { ENDPOINT_SERVER } from "@/config/constant.config"
import { api } from "@/lib/http"
import type { QuestionnaireResponse, QuizCompletionResult } from "../interfaces/questionnaire.interface"

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

export const questionnaireService = {
  create: async (): Promise<QuestionnaireResponse> => {
    const { data } = await api.post<QuestionnaireResponse>(ENDPOINT_SERVER.QUESTIONNAIRES)
    return data
  },

  getActive: async (): Promise<QuestionnaireResponse> => {
    const { data } = await api.get<QuestionnaireResponse>(ENDPOINT_SERVER.QUESTIONNAIRES_ACTIVE)
    return data
  },

  submit: async (id: number, payload: SubmitPayload): Promise<QuizCompletionResult> => {
    const { data } = await api.patch<QuizCompletionResult>(
      `${ENDPOINT_SERVER.QUESTIONNAIRES}/${id}/complete`,
      payload,
    )
    return data
  },

  abandon: async (id: number): Promise<void> => {
    await api.patch(`${ENDPOINT_SERVER.QUESTIONNAIRES}/${id}/abandon`)
  },
}
