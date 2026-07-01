import { create } from "zustand"
import type { SSENotificationPayload } from "../interfaces/notification.interface"

interface NotificationState {
  unreadCount: number
  lastSSEEvent: SSENotificationPayload | null
  pushPermission: NotificationPermission
  setUnreadCount: (count: number) => void
  incrementUnreadCount: () => void
  decrementUnreadCount: () => void
  setLastSSEEvent: (event: SSENotificationPayload) => void
  setPushPermission: (permission: NotificationPermission) => void
}

const initialPushPermission: NotificationPermission =
  typeof window !== "undefined" && "Notification" in window
    ? Notification.permission
    : "default"

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  lastSSEEvent: null,
  pushPermission: initialPushPermission,

  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnreadCount: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  decrementUnreadCount: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  setLastSSEEvent: (event) => set({ lastSSEEvent: event }),
  setPushPermission: (permission) => set({ pushPermission: permission }),
}))
