import { useEffect, useState } from "react"
import { createBrowserRouter, Navigate, RouterProvider } from "react-router"
import { ROUTING } from "@/config/constant.config"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { RegisterPage } from "@/features/auth/pages/RegisterPage"
import { RegisterPendingPage } from "@/features/auth/pages/RegisterPendingPage"
import { authService } from "@/features/auth/services/auth.service"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { ProtectedRoute } from "./ProtectedRoute"
import { PublicRoutes } from "./PublicRoutes"

const router = createBrowserRouter([
  {
    path: ROUTING.HOME,
    element: <Navigate to={ROUTING.DASHBOARD} replace />,
  },
  {
    element: <PublicRoutes />,
    children: [
      { path: ROUTING.LOGIN, element: <LoginPage /> },
      { path: ROUTING.REGISTER, element: <RegisterPage /> },
      { path: ROUTING.REGISTER_PENDING, element: <RegisterPendingPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [{ path: ROUTING.DASHBOARD, element: <div>Dashboard</div> }],
  },
  {
    path: "*",
    element: <Navigate to={ROUTING.HOME} replace />,
  },
])

export function AppRouter() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const { setSession, clearSession } = useAuthStore.getState()

    authService.onUnauthorized(() => {
      clearSession()
      void router.navigate(ROUTING.LOGIN)
    })

    authService
      .me()
      .then(({ user }) => setSession(user))
      .catch(() => clearSession())
      .finally(() => setReady(true))
  }, [])

  if (!ready) return null

  return <RouterProvider router={router} />
}
