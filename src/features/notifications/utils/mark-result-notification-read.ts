import { notificationService } from "../services/notification.service"
import { useNotificationStore } from "../store/notification.store"

/**
 * HU-35: opening a result marks its unread `result_available` notification as read.
 *
 * Uses only the existing endpoints (`GET /notifications?unread=true`, `PATCH /notifications/:id/read`,
 * `GET /notifications/unread-count`). Does nothing when no unread notification points to the result.
 * Callers treat it as fire-and-forget: it may reject, and it must never block the page.
 */
export async function markResultNotificationRead(resultId: number): Promise<void> {
  const { items } = await notificationService.list({ unread: true })
  const matches = items.filter(
    (n) => n.type === "result_available" && n.resultId === resultId && !n.isRead,
  )
  if (matches.length === 0) return

  await Promise.allSettled(matches.map((n) => notificationService.markOneRead(n.id)))

  // Re-read the authoritative count so the topbar badge drops exactly once,
  // even if the page effect runs twice (React StrictMode) or another tab marked it already.
  const count = await notificationService.getUnreadCount()
  useNotificationStore.getState().setUnreadCount(count)
}
