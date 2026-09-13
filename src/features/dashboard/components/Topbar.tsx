import { useCallback, useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { Bell, BellDot, Menu } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { ROLE, ROUTING } from "@/config/constant.config"
import { notificationService } from "@/features/notifications/services/notification.service"
import { useNotificationStore } from "@/features/notifications/store/notification.store"
import { useNotificationStream } from "@/features/notifications/hooks/use-notification-stream"
import { useQuestionGenerationStore } from "@/features/questions/store/question-generation.store"
import { ACADEMIC_GRADES } from "@/data/academic-grades"
import { Avatar } from "./Avatar"
import { roleLabel } from "../utils/nav"
import type { SSENotificationPayload } from "@/features/notifications/interfaces/notification.interface"

const VAK_LABEL: Record<string, string> = {
  Visual: "Visual",
  Auditory: "Auditivo",
  Kinesthetic: "Kinestésico",
}

// Tailwind color tokens → hex so Sonner's per-toast `style` can override its CSS vars
const TOAST_SUCCESS_STYLE: React.CSSProperties = {
  background: "#f0fdf4",   // emerald-50
  color: "#14532d",         // emerald-900
  border: "1px solid #bbf7d0", // emerald-200
}

const TOAST_ERROR_STYLE: React.CSSProperties = {
  background: "#fff1f2",   // rose-50
  color: "#881337",         // rose-900
  border: "1px solid #fecdd3", // rose-200
}

const supportsPush = typeof window !== "undefined" && "Notification" in window

function sendBrowserNotification(title: string, body: string) {
  if (!supportsPush || Notification.permission !== "granted") return
  new Notification(title, { body, icon: "/favicon.svg" })
}

/** Fallback polling for the unread badge in case SSE events are lost. */
const UNREAD_POLL_INTERVAL_MS = 30_000
/**
 * Per-question SSE events aren't stored notifications; the stored summary is
 * created once the batch ends, so the badge is re-fetched shortly after the last event.
 */
const UNREAD_REFETCH_DEBOUNCE_MS = 2_000

interface TopbarProps {
  /** Opens the navigation drawer on screens below the laptop breakpoint. */
  onOpenMenu?: () => void
}

/** Top bar: menu (mobile) + bell + push opt-in + profile. SSE connection lives here. */
export function Topbar({ onOpenMenu }: TopbarProps) {
  const user = useAuthStore((s) => s.user)
  const roleId = useAuthStore((s) => s.roleId)
  const navigate = useNavigate()

  const name = user?.name ?? "Usuario"
  const schoolName = user?.school?.name
  const gradeName = roleId === ROLE.STUDENT
    ? ACADEMIC_GRADES.find((g) => g.id === user?.academicGradeId)?.name
    : undefined
  const meta = [roleLabel(roleId), gradeName, schoolName].filter(Boolean).join(" · ")

  const {
    unreadCount,
    setUnreadCount,
    setLastSSEEvent,
    pushPermission,
    setPushPermission,
    requestResync,
  } = useNotificationStore()

  const canReceiveNotifications = roleId === ROLE.STUDENT || roleId === ROLE.TEACHER

  const refreshUnreadCount = useCallback(() => {
    notificationService.getUnreadCount()
      .then(setUnreadCount)
      .catch(() => {})
  }, [setUnreadCount])

  // Initial unread count + light polling as a fallback for missed SSE events.
  useEffect(() => {
    if (!canReceiveNotifications) return
    refreshUnreadCount()
    const id = setInterval(refreshUnreadCount, UNREAD_POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [canReceiveNotifications, refreshUnreadCount])

  const recordGenerationEvent = useQuestionGenerationStore((s) => s.recordEvent)
  const unreadRefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (unreadRefetchTimerRef.current) clearTimeout(unreadRefetchTimerRef.current)
  }, [])

  const handleSSEEvent = useCallback((payload: SSENotificationPayload) => {
    setLastSSEEvent(payload)
    recordGenerationEvent()
    if (unreadRefetchTimerRef.current) clearTimeout(unreadRefetchTimerRef.current)
    unreadRefetchTimerRef.current = setTimeout(refreshUnreadCount, UNREAD_REFETCH_DEBOUNCE_MS)

    if (payload.type === "question_generated") {
      const label = VAK_LABEL[payload.vakStyle] ?? payload.vakStyle
      toast.success(`Pregunta ${label} generada — #${payload.questionId}`, {
        style: TOAST_SUCCESS_STYLE,
        duration: 4000,
      })
      sendBrowserNotification(
        "Math.E — Nueva pregunta generada",
        `Pregunta ${label} #${payload.questionId} lista para revisar.`,
      )
    } else if (payload.type === "question_failed") {
      const label = VAK_LABEL[payload.vakStyle] ?? payload.vakStyle
      toast.error(`Una pregunta ${label} falló al generarse`, {
        style: TOAST_ERROR_STYLE,
        duration: 5000,
      })
      sendBrowserNotification(
        "Math.E — Error de generación",
        `Una pregunta ${label} falló al generarse.`,
      )
    }
  }, [setLastSSEEvent, recordGenerationEvent, refreshUnreadCount])

  const handleStreamOpen = useCallback((isReconnect: boolean) => {
    if (!isReconnect) return
    // Events may have been missed while disconnected: re-sync badge and lists.
    refreshUnreadCount()
    requestResync()
  }, [refreshUnreadCount, requestResync])

  useNotificationStream(canReceiveNotifications, {
    onEvent: handleSSEEvent,
    onOpen: handleStreamOpen,
  })

  // Only ever called from a click — browsers ignore or penalize prompts without a user gesture.
  async function requestPushPermission() {
    if (!supportsPush || Notification.permission !== "default") return
    try {
      const result = await Notification.requestPermission()
      setPushPermission(result)
      if (result === "granted") {
        toast.success("Notificaciones del sistema activadas.", {
          style: TOAST_SUCCESS_STYLE,
          duration: 3000,
        })
      }
    } catch {
      // Unsupported permission API variant — ignore
    }
  }

  function handleBellClick() {
    void requestPushPermission()
    navigate(ROUTING.DASHBOARD_NOTIFICATIONS)
  }

  return (
    <header className="flex h-20 shrink-0 items-center justify-end gap-2 border-b border-mathe-border bg-mathe-white px-4 tablet:px-8">

      {onOpenMenu && (
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menú"
          className="mr-auto grid size-10 place-items-center rounded-xl text-mathe-muted transition-colors hover:bg-mathe-surface hover:text-mathe-ink laptop:hidden"
        >
          <Menu className="size-5" />
        </button>
      )}

      {/* Push opt-in button — only while permission is "default" (not yet decided) */}
      {canReceiveNotifications && supportsPush && pushPermission === "default" && (
        <button
          type="button"
          onClick={() => { void requestPushPermission() }}
          title="Activar notificaciones fuera de la pestaña"
          aria-label="Activar notificaciones del sistema"
          className="relative grid size-10 place-items-center rounded-xl text-mathe-muted transition-colors hover:bg-mathe-surface hover:text-mathe-blue"
        >
          <BellDot className="size-5" />
        </button>
      )}

      {/* Bell icon — students and teachers */}
      {canReceiveNotifications && (
        <button
          type="button"
          onClick={handleBellClick}
          aria-label="Notificaciones"
          className="relative grid size-10 place-items-center rounded-xl text-mathe-muted transition-colors hover:bg-mathe-surface hover:text-mathe-ink"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-[-2px] flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-0.5 py-0.5 text-[10px] font-bold leading-none text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Profile button */}
      <button
        type="button"
        onClick={() => navigate(ROUTING.DASHBOARD_PROFILE)}
        className="flex items-center gap-3 rounded-2xl px-3 py-2 transition-colors hover:bg-mathe-surface"
      >
        <div className="hidden text-right leading-tight tablet:block">
          <p className="text-sm font-semibold text-mathe-ink">{name}</p>
          {meta && <p className="text-xs text-mathe-muted">{meta}</p>}
        </div>
        <Avatar name={name} />
      </button>
    </header>
  )
}
