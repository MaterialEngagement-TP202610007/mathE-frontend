import { Navigate, Outlet } from "react-router"
import { ROUTING } from "@/config/constant.config"
import { useAuthStore } from "@/features/auth/store/auth.store"

interface ProtectedRouteProps {
  allowedRoles?: number[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const roleId = useAuthStore((s) => s.roleId)

  if (!isAuthenticated) {
    return <Navigate to={ROUTING.LOGIN} replace />
  }

  // Wrong role: back to the dashboard index, which every role may open (it renders the
  // role's home, or sends admins to teacher approval), so this can never loop.
  if (allowedRoles && (roleId === null || !allowedRoles.includes(roleId))) {
    return <Navigate to={ROUTING.DASHBOARD} replace />
  }

  return <Outlet />
}
