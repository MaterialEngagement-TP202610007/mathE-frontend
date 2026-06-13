import { useEffect, useState } from "react"
import { createBrowserRouter, Navigate, RouterProvider } from "react-router"
import { ROUTING } from "@/config/constant.config"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { RegisterPage } from "@/features/auth/pages/RegisterPage"
import { RegisterPendingPage } from "@/features/auth/pages/RegisterPendingPage"
import { authService } from "@/features/auth/services/auth.service"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { PlaceholderPage } from "@/features/dashboard/components/PlaceholderPage"
import { DashboardHome } from "@/features/dashboard/pages/DashboardHome"
import { QuizPage } from "@/features/quiz/pages/QuizPage"
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
    children: [
      // Full-screen quiz — intentionally outside DashboardLayout (no sidebar/topbar).
      { path: ROUTING.QUIZ, element: <QuizPage /> },
      {
        path: ROUTING.DASHBOARD,
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardHome /> },
          {
            path: "nuevo-cuestionario",
            element: <PlaceholderPage title="Nuevo cuestionario" />,
          },
          {
            path: "historial",
            element: <PlaceholderPage title="Historial" />,
          },
          { path: "perfil", element: <PlaceholderPage title="Perfil" /> },
          {
            path: "preguntas",
            element: <PlaceholderPage title="Preguntas" />,
          },
          {
            path: "estudiantes",
            element: <PlaceholderPage title="Estudiantes" />,
          },
        ],
      },
    ],
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
