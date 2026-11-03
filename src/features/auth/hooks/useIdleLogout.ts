import { useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { IDLE_LOGOUT_MS, ROUTING } from "@/config/constant.config"
import { useAuthStore } from "../store/auth.store"

/** Activity is recorded at most once per window to avoid timer churn on pointer moves. */
const ACTIVITY_THROTTLE_MS = 5_000

/** Shared across tabs so activity in one tab keeps the others (same cookie) signed in. */
const LAST_ACTIVITY_KEY = "mathe-last-activity"

const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart"] as const

function readSharedActivity(): number {
  try {
    return Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || 0
  } catch {
    return 0
  }
}

function writeSharedActivity(timestamp: number) {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(timestamp))
  } catch {
    // Storage unavailable (private mode, quota): this tab still tracks its own activity.
  }
}

interface UseIdleLogoutOptions {
  /** Runs right before signing out, e.g. to lift a navigation blocker. */
  onBeforeLogout?: () => void
}

/**
 * Signs the user out after `IDLE_LOGOUT_MS` without pointer, keyboard, scroll or
 * touch activity (HU-07 / HU-14), then shows the login screen with an
 * inactivity notice. Uses timers and refs only: activity never re-renders.
 * The persisted quiz is kept so the same student can resume after logging in.
 */
export function useIdleLogout({ onBeforeLogout }: UseIdleLogoutOptions = {}) {
  const navigate = useNavigate()
  const onBeforeLogoutRef = useRef(onBeforeLogout)

  useEffect(() => {
    onBeforeLogoutRef.current = onBeforeLogout
  }, [onBeforeLogout])

  useEffect(() => {
    let lastActivity = Date.now()
    let timer: number | undefined
    let loggingOut = false

    const schedule = (delay: number) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(check, delay)
    }

    const recordActivity = () => {
      lastActivity = Date.now()
      writeSharedActivity(lastActivity)
      schedule(IDLE_LOGOUT_MS)
    }

    const logOut = async () => {
      loggingOut = true
      onBeforeLogoutRef.current?.()
      try {
        await useAuthStore.getState().logout({ keepQuiz: true, reason: "idle" })
      } catch {
        // The local session is cleared even if the logout request fails.
      }
      navigate(ROUTING.LOGIN, { replace: true })
    }

    // Timers may fire late (sleeping laptop, throttled background tab): compare real time.
    function check() {
      if (loggingOut) return
      const latest = Math.max(lastActivity, readSharedActivity())
      const idleFor = Date.now() - latest
      if (idleFor < IDLE_LOGOUT_MS) {
        schedule(IDLE_LOGOUT_MS - idleFor)
        return
      }
      void logOut()
    }

    const onActivity = () => {
      if (loggingOut || Date.now() - lastActivity < ACTIVITY_THROTTLE_MS) return
      recordActivity()
    }

    // Returning to a tab that was idle past the limit logs out instead of extending the session.
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible" || loggingOut) return
      const latest = Math.max(lastActivity, readSharedActivity())
      if (Date.now() - latest >= IDLE_LOGOUT_MS) {
        void logOut()
        return
      }
      recordActivity()
    }

    recordActivity()
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true })
    }
    // Scroll does not bubble: capture it from any scrollable container.
    window.addEventListener("scroll", onActivity, { passive: true, capture: true })
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      window.clearTimeout(timer)
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity)
      }
      window.removeEventListener("scroll", onActivity, { capture: true })
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [navigate])
}
