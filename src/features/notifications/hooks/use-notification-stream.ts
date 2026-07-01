import { useEffect, useRef } from "react"
import { ENV } from "@/config/env.config"
import type { SSENotificationPayload } from "../interfaces/notification.interface"

export function useNotificationStream(
  enabled: boolean,
  onEvent: (payload: SSENotificationPayload) => void,
) {
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  useEffect(() => {
    if (!enabled) return

    const es = new EventSource(`${ENV.API_URL}/api/notifications/stream`, {
      withCredentials: true,
    })

    es.addEventListener("notification", (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data as string) as SSENotificationPayload
        onEventRef.current(payload)
      } catch {
        // malformed event — ignore
      }
    })

    es.addEventListener("error", () => {
      if (es.readyState === EventSource.CLOSED) {
        // rejected by server (401/403) — don't retry with bad credentials
        es.close()
      }
      // if readyState is CONNECTING, browser is already retrying automatically
    })

    return () => es.close()
  }, [enabled])
}
