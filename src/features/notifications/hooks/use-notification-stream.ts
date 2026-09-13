import { useEffect, useRef } from "react"
import { ENV } from "@/config/env.config"
import type { SSENotificationPayload } from "../interfaces/notification.interface"

const RECONNECT_BASE_DELAY_MS = 2_000
const RECONNECT_MAX_DELAY_MS = 30_000

interface NotificationStreamHandlers {
  onEvent: (payload: SSENotificationPayload) => void
  /**
   * Fires on every successful (re)connection. `isReconnect` is true when a
   * previous connection was lost, so callers can re-sync events missed in the gap.
   */
  onOpen?: (isReconnect: boolean) => void
}

/**
 * Subscribes to the backend SSE stream (`notification` events) while `enabled`.
 * Lost or rejected connections are re-opened with exponential backoff
 * (2 s → 30 s) until the component unmounts.
 */
export function useNotificationStream(enabled: boolean, handlers: NotificationStreamHandlers) {
  const handlersRef = useRef(handlers)

  // Keep the latest callbacks without re-opening the connection on every render.
  useEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    if (!enabled) return

    let source: EventSource | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let attempt = 0
    let hasConnectedBefore = false
    let disposed = false

    const scheduleReconnect = () => {
      if (disposed || retryTimer) return
      const delay = Math.min(RECONNECT_BASE_DELAY_MS * 2 ** attempt, RECONNECT_MAX_DELAY_MS)
      attempt += 1
      retryTimer = setTimeout(() => {
        retryTimer = null
        connect()
      }, delay)
    }

    const connect = () => {
      if (disposed) return
      const es = new EventSource(`${ENV.API_URL}/api/notifications/stream`, {
        withCredentials: true,
      })
      source = es

      es.addEventListener("open", () => {
        attempt = 0
        handlersRef.current.onOpen?.(hasConnectedBefore)
        hasConnectedBefore = true
      })

      es.addEventListener("notification", (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data as string) as SSENotificationPayload
          handlersRef.current.onEvent(payload)
        } catch {
          // malformed event — ignore
        }
      })

      es.addEventListener("error", () => {
        // Take over from the browser's fixed-interval retry so backoff is bounded and predictable.
        es.close()
        if (source === es) source = null
        scheduleReconnect()
      })
    }

    connect()

    return () => {
      disposed = true
      if (retryTimer) clearTimeout(retryTimer)
      source?.close()
    }
  }, [enabled])
}
