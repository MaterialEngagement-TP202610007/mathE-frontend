import { create } from "zustand"
import type { SSENotificationPayload } from "../interfaces/notification.interface"

interface NotificationState {
  unreadCount: number
  lastSSEEvent: SSENotificationPayload | null
  pushPermission: NotificationPermission
  /** Bumped when the SSE stream reconnects; lists re-fetch to recover missed events. */
  resyncVersion: number
  setUnreadCount: (count: number) => void
  decrementUnreadCount: () => void
  setLastSSEEvent: (event: SSENotificationPayload) => void
  setPushPermission: (permission: NotificationPermission) => void
  requestResync: () => void
  /** Clears per-user state. Push permission is browser-level, so it is kept. */
  reset: () => void
}

const initialPushPermission: NotificationPermission =
  typeof window !== "undefined" && "Notification" in window
    ? Notification.permission
    : "default"

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  lastSSEEvent: null,
  pushPermission: initialPushPermission,
  resyncVersion: 0,

  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnreadCount: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  setLastSSEEvent: (event) => set({ lastSSEEvent: event }),
  setPushPermission: (permission) => set({ pushPermission: permission }),
  requestResync: () => set((s) => ({ resyncVersion: s.resyncVersion + 1 })),
  reset: () => set({ unreadCount: 0, lastSSEEvent: null, resyncVersion: 0 }),
}))
