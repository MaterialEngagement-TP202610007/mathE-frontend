export type VakStyleApi = "Visual" | "Auditory" | "Kinesthetic"
export type QuestionStatus = "pending" | "approved" | "rejected"

export interface QuestionOption {
  id: number
  text: string
  vakValue: "V" | "A" | "K"
}

export interface Question {
  id: number
  statement: string
  contentType: "text" | "image" | "audio"
  mediaUrl: string | null
  vakStyle: VakStyleApi
  status: QuestionStatus
  rejectionReason: string | null
  createdById: number
  createdAt: string
  updatedAt: string
  options: QuestionOption[]
}

export interface GenerateQuestionPayload {
  vakStyle: VakStyleApi
}

export interface RejectQuestionPayload {
  rejectionReason: string
}

export interface ListQuestionsParams {
  status?: QuestionStatus
  page?: number
  limit?: number
}
