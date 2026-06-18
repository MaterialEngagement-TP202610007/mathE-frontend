import { LogOut } from "lucide-react"
import { NavLink, useNavigate } from "react-router"
import { ROUTING } from "@/config/constant.config"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { useQuizIntroStore } from "@/features/quiz/store/quiz-intro.store"
import { useQuizStatusStore } from "@/features/quiz/store/quiz-status.store"
import { MatheLogo } from "@/shared/components/icons/MatheLogo"
import { cn } from "@/lib/utils"
import { navForRole } from "../utils/nav"

const navItemClass = (isActive: boolean) =>
  cn(
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-mathe-surface text-mathe-blue"
      : "text-mathe-muted hover:bg-mathe-surface hover:text-mathe-ink",
  )

export function Sidebar() {
  const roleId = useAuthStore((s) => s.roleId)
  const logout = useAuthStore((s) => s.logout)
  const openQuizIntro = useQuizIntroStore((s) => s.open)
  const availability = useQuizStatusStore((s) => s.availability)
  const navigate = useNavigate()
  const items = navForRole(roleId)

  const quizNavDisabled = availability === "checking" || availability === "has_remote"

  const onLogout = async () => {
    await logout()
    navigate(ROUTING.LOGIN, { replace: true })
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-mathe-border bg-mathe-white laptop:flex">
      <div className="flex h-20 items-center justify-center border-b border-mathe-border">
        <MatheLogo width={120} height={56} />
      </div>

      <nav className="grid content-start gap-1 px-3 py-6">
        {items.map(({ label, to, icon: Icon, end }) =>
          // "Nuevo cuestionario" opens the consent modal instead of routing.
          to === ROUTING.DASHBOARD_NEW ? (
            <button
              key={to}
              type="button"
              onClick={quizNavDisabled ? undefined : openQuizIntro}
              disabled={quizNavDisabled}
              className={cn(
                navItemClass(false),
                quizNavDisabled && "cursor-not-allowed opacity-40",
              )}
            >
              <Icon className="size-5" />
              {label}
            </button>
          ) : (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => navItemClass(isActive)}
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ),
        )}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="mt-auto flex items-center gap-3 px-6 py-6 text-sm font-medium text-mathe-muted transition-colors hover:text-mathe-ink"
      >
        <LogOut className="size-5" />
        Cerrar sesión
      </button>
    </aside>
  )
}
