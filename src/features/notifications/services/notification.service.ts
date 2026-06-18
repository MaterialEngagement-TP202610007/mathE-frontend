import { ENDPOINT_SERVER } from "@/config/constant.config"
import { api } from "@/lib/http"
import type { PaginatedResponse } from "@/shared/interfaces/pagination.interface"
import type {
  Notification,
  UnreadCountResponse,
  ListNotificationsParams,
} from "../interfaces/notification.interface"

export const notificationService = {
  list: async (params?: ListNotificationsParams): Promise<PaginatedResponse<Notification>> => {
    const { data } = await api.get<PaginatedResponse<Notification>>(ENDPOINT_SERVER.NOTIFICATIONS, { params })
    return data
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get<UnreadCountResponse>(ENDPOINT_SERVER.NOTIFICATIONS_UNREAD_COUNT)
    return data.count
  },

  markAllRead: async (): Promise<void> => {
    await api.patch(ENDPOINT_SERVER.NOTIFICATIONS_READ_ALL)
  },

  markOneRead: async (id: number): Promise<void> => {
    await api.patch(`${ENDPOINT_SERVER.NOTIFICATIONS}/${id}/read`)
  },
}
