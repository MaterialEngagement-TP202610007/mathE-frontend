export type VakStyleApi = "Visual" | "Auditory" | "Kinesthetic"
export type QuestionStatus = "pending" | "approved" | "rejected"

export interface QuestionOption {
  id: number
  questionId: number
  text: string
  vakValue: "V" | "A" | "K"
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface Question {
  id: number
  statement: string
  contentType: "text" | "image" | "audio"
  mediaUrl: string | null
  vakStyle: VakStyleApi
  validationStatus: QuestionStatus
  origin: string
  generationDate: string
  teacherId: number | null
  rejectionReason: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  options: QuestionOption[]
}

export interface GenerateQuestionPayload {
  vakStyle: VakStyleApi
  teacherId?: number | null
}

export interface GenerateBatchPayload {
  count: number
  vakStyle: VakStyleApi
  teacherId?: number | null
}

export interface GenerateBatchResponse {
  message: string
  vakStyle: string
  count: number
}

export interface RejectQuestionPayload {
  rejectionReason: string
}

export interface ListQuestionsParams {
  status?: QuestionStatus
  vakStyle?: VakStyleApi
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}

export interface ValidatedHistoryParams {
  vakStyle?: VakStyleApi
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}
