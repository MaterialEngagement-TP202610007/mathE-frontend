import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Bell } from "lucide-react"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { ROLE, ROUTING } from "@/config/constant.config"
import { notificationService } from "@/features/notifications/services/notification.service"
import { ACADEMIC_GRADES } from "@/data/academic-grades"
import { Avatar } from "./Avatar"
import { roleLabel } from "../utils/nav"

/** Top bar: bell icon (students only) + profile button. */
export function Topbar() {
  const user = useAuthStore((s) => s.user)
  const roleId = useAuthStore((s) => s.roleId)
  const navigate = useNavigate()

  const name = user?.name ?? "Usuario"
  const schoolName = user?.school?.name
  const gradeName = roleId === ROLE.STUDENT
    ? ACADEMIC_GRADES.find((g) => g.id === user?.academicGradeId)?.name
    : undefined
  const meta = [roleLabel(roleId), gradeName, schoolName].filter(Boolean).join(" · ")

  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (roleId !== ROLE.STUDENT && roleId !== ROLE.TEACHER) return

    const fetch = () => {
      notificationService.getUnreadCount()
        .then(setUnreadCount)
        .catch(() => {})
    }

    fetch()
    const id = setInterval(fetch, 60_000)
    return () => clearInterval(id)
  }, [roleId])

  return (
    <header className="flex h-20 shrink-0 items-center justify-end gap-2 border-b border-mathe-border bg-mathe-white px-8">

      {/* Bell icon — students and teachers */}
      {(roleId === ROLE.STUDENT || roleId === ROLE.TEACHER) && (
        <button
          type="button"
          onClick={() => navigate(ROUTING.DASHBOARD_NOTIFICATIONS)}
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
        <div className="text-right leading-tight">
          <p className="text-sm font-semibold text-mathe-ink">{name}</p>
          {meta && <p className="text-xs text-mathe-muted">{meta}</p>}
        </div>
        <Avatar name={name} />
      </button>
    </header>
  )
}
