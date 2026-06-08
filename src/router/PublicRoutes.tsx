import { Navigate, Outlet } from "react-router"
import { ROUTING } from "@/config/constant.config"
import { useAuthStore } from "@/features/auth/store/auth.store"

/**
 * Public-only routes (login/register). Already-authenticated users are sent
 * to the dashboard instead of seeing the auth forms again.
 */
export function PublicRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to={ROUTING.DASHBOARD} replace />
  }

  return <Outlet />
}
