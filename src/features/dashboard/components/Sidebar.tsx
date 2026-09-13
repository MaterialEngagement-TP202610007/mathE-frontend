import { LogOut, X } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
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

interface SidebarContentProps {
  /** Called after any navigation/action, e.g. to close the mobile drawer. */
  onNavigate?: () => void
}

/** Nav items + logout, shared by the desktop sidebar and the mobile drawer. */
function SidebarContent({ onNavigate }: SidebarContentProps) {
  const roleId = useAuthStore((s) => s.roleId)
  const logout = useAuthStore((s) => s.logout)
  const openQuizIntro = useQuizIntroStore((s) => s.open)
  const availability = useQuizStatusStore((s) => s.availability)
  const navigate = useNavigate()
  const items = navForRole(roleId)

  const quizNavDisabled = availability === "checking" || availability === "has_remote"

  const onLogout = async () => {
    onNavigate?.()
    await logout()
    navigate(ROUTING.LOGIN, { replace: true })
  }

  return (
    <>
      <nav className="grid content-start gap-1 px-3 py-6">
        {items.map(({ label, to, icon: Icon, end }) =>
          // "Nuevo cuestionario" opens the consent modal instead of routing.
          to === ROUTING.DASHBOARD_NEW ? (
            <button
              key={to}
              type="button"
              onClick={
                quizNavDisabled
                  ? undefined
                  : () => {
                      onNavigate?.()
                      openQuizIntro()
                    }
              }
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
              onClick={onNavigate}
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
    </>
  )
}

/** Persistent sidebar — laptop breakpoint and up. */
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-mathe-border bg-mathe-white laptop:flex">
      <div className="flex h-20 items-center justify-center border-b border-mathe-border">
        <MatheLogo width={120} height={56} />
      </div>
      <SidebarContent />
    </aside>
  )
}

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Slide-in drawer with the same navigation, for screens below the laptop breakpoint. */
export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const close = () => onOpenChange(false)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm laptop:hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-mathe-border bg-mathe-white shadow-2xl outline-none laptop:hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          )}
        >
          <DialogPrimitive.Title className="sr-only">Menú de navegación</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Accede a las secciones del panel o cierra sesión.
          </DialogPrimitive.Description>

          <div className="flex h-20 items-center justify-between border-b border-mathe-border px-5">
            <MatheLogo width={108} height={50} />
            <DialogPrimitive.Close
              aria-label="Cerrar menú"
              className="grid size-10 place-items-center rounded-xl text-mathe-muted transition-colors hover:bg-mathe-surface hover:text-mathe-ink"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
          </div>

          <SidebarContent onNavigate={close} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
