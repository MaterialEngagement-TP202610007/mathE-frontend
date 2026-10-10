import { Navigate, Outlet, useParams } from "react-router"
import { ROLE, ROUTING } from "@/config/constant.config"
import { useAuthStore } from "@/features/auth/store/auth.store"

interface ProtectedRouteProps {
  allowedRoles?: number[]
  /**
   * Route param that must equal the signed-in student's own user id. Other roles
   * are not restricted by it (HU-34: a student only opens their own evolution).
   */
  studentOwnParam?: string
}

export function ProtectedRoute({ allowedRoles, studentOwnParam }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const roleId = useAuthStore((s) => s.roleId)
  const userId = useAuthStore((s) => s.user?.id)
  const params = useParams()

  if (!isAuthenticated) {
    return <Navigate to={ROUTING.LOGIN} replace />
  }

  // Wrong role: back to the dashboard index, which every role may open (it renders the
  // role's home, or sends admins to teacher approval), so this can never loop.
  if (allowedRoles && (roleId === null || !allowedRoles.includes(roleId))) {
    return <Navigate to={ROUTING.DASHBOARD} replace />
  }

  if (
    studentOwnParam &&
    roleId === ROLE.STUDENT &&
    (userId === undefined || params[studentOwnParam] !== String(userId))
  ) {
    return <Navigate to={ROUTING.DASHBOARD} replace />
  }

  return <Outlet />
}
