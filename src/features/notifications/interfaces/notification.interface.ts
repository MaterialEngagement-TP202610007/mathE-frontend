export type NotificationType = "result_available" | "account_activated" | string

export interface Notification {
  id: number
  studentId: number
  resultId: number | null
  type: NotificationType
  message: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export interface UnreadCountResponse {
  count: number
}

export interface ListNotificationsParams {
  page?: number
  limit?: number
  unread?: boolean
}

// Fires per question as each one completes (may arrive many times per batch)
export type SSENotificationPayload =
  | { type: "question_generated"; questionId: number; vakStyle: string }
  | { type: "question_failed"; vakStyle: string }
