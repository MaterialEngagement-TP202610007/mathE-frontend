import { useCallback, useEffect, useState } from "react"
import { createBrowserRouter, Navigate, RouterProvider } from "react-router"
import { ROLE, ROUTING } from "@/config/constant.config"
import { Toaster } from "@/components/ui/sonner"
import { HttpError, isTransientError, sleep } from "@/lib/http"
import { AppSplash } from "@/shared/components/AppSplash"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { RegisterPage } from "@/features/auth/pages/RegisterPage"
import { RegisterPendingPage } from "@/features/auth/pages/RegisterPendingPage"
import { authService } from "@/features/auth/services/auth.service"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { DashboardHome } from "@/features/dashboard/pages/DashboardHome"
import { QuizPage } from "@/features/quiz/pages/QuizPage"
import { ResultDetailPage } from "@/features/results/pages/ResultDetailPage"
import { ResultsHistoryPage } from "@/features/results/pages/ResultsHistoryPage"
import { ReportsPage } from "@/features/results/pages/ReportsPage"
import { StudentResultsHistoryPage } from "@/features/results/pages/StudentResultsHistoryPage"
import { ProfilePage } from "@/features/users/pages/ProfilePage"
import { NotificationsPage } from "@/features/notifications/pages/NotificationsPage"
import { PendingQuestionsPage } from "@/features/questions/pages/PendingQuestionsPage"
import { QuestionReviewPage } from "@/features/questions/pages/QuestionReviewPage"
import { ValidationHistoryPage } from "@/features/questions/pages/ValidationHistoryPage"
import { ValidationHistoryDetailPage } from "@/features/questions/pages/ValidationHistoryDetailPage"
import { StudentsPage } from "@/features/users/pages/StudentsPage"
import { TeachersApprovalPage } from "@/features/users/pages/TeachersApprovalPage"
import { ProtectedRoute } from "./ProtectedRoute"
import { PublicRoutes } from "./PublicRoutes"
import { RouteErrorPage } from "./RouteErrorPage"

/** Roles bound to a school (students and teachers); admins are excluded from their screens. */
const SCHOOL_ROLES = [ROLE.STUDENT, ROLE.TEACHER]

const router = createBrowserRouter([
  {
    // Pathless root: one errorElement for every route below.
    errorElement: <RouteErrorPage />,
    children: [
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
          // Full-screen pages — intentionally outside DashboardLayout (no sidebar/topbar).
          {
            element: <ProtectedRoute allowedRoles={SCHOOL_ROLES} />,
            children: [{ path: ROUTING.QUIZ, element: <QuizPage /> }],
          },
          {
            path: ROUTING.DASHBOARD,
            element: <DashboardLayout />,
            children: [
              // Shared by every role; admins are redirected to teacher approval from here.
              { index: true, element: <DashboardHome /> },
              { path: "perfil", element: <ProfilePage /> },
              {
                element: <ProtectedRoute allowedRoles={[ROLE.ADMIN]} />,
                children: [{ path: "profesores", element: <TeachersApprovalPage /> }],
              },
              {
                // Student/teacher screens call endpoints that answer 403 to admins.
                element: <ProtectedRoute allowedRoles={SCHOOL_ROLES} />,
                children: [
                  {
                    path: "historial",
                    element: <ResultsHistoryPage />,
                  },
                  { path: "notificaciones", element: <NotificationsPage /> },
                  {
                    path: "preguntas",
                    element: <PendingQuestionsPage />,
                  },
                  {
                    path: "preguntas/:id",
                    element: <QuestionReviewPage />,
                  },
                  {
                    path: "estudiantes",
                    element: <StudentsPage />,
                  },
                  {
                    path: "historial-validacion",
                    element: <ValidationHistoryPage />,
                  },
                  {
                    path: "historial-validacion/:id",
                    element: <ValidationHistoryDetailPage />,
                  },
                  {
                    path: "reportes",
                    element: <ReportsPage />,
                  },
                  {
                    path: "evolucion/estudiante/:studentId",
                    element: <StudentResultsHistoryPage />,
                  },
                  {
                    path: "resultados/:id",
                    element: <ResultDetailPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to={ROUTING.HOME} replace />,
      },
    ],
  },
])

/** Total time spent retrying `/auth/me` while the backend wakes up (cold start ≈ 50 s). */
const BOOT_RETRY_BUDGET_MS = 60_000
const BOOT_RETRY_MAX_DELAY_MS = 8_000

type BootState = "loading" | "ready" | "unreachable"

/**
 * Resolves the session at boot. Only a 401 means "logged out"; transient
 * failures (proxy timeout, 502/503/504, network) are retried with backoff.
 */
async function resolveSession(): Promise<"ready" | "unreachable"> {
  const { setSession, expireSession } = useAuthStore.getState()
  const deadline = Date.now() + BOOT_RETRY_BUDGET_MS
  let delay = 1_000

  for (;;) {
    try {
      const { user } = await authService.me()
      setSession(user)
      return "ready"
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        expireSession()
        return "ready"
      }
      if (!isTransientError(error)) {
        // Unexpected error: keep the persisted session; later 401s still log out.
        return "ready"
      }
      if (Date.now() + delay > deadline) {
        // Anonymous visitors can still reach the public pages.
        return useAuthStore.getState().isAuthenticated ? "unreachable" : "ready"
      }
      await sleep(delay)
      delay = Math.min(delay * 2, BOOT_RETRY_MAX_DELAY_MS)
    }
  }
}

export function AppRouter() {
  const [boot, setBoot] = useState<BootState>("loading")

  const start = useCallback(() => {
    setBoot("loading")
    void resolveSession().then(setBoot)
  }, [])

  useEffect(() => {
    authService.onUnauthorized(() => {
      useAuthStore.getState().expireSession()
      void router.navigate(ROUTING.LOGIN)
    })

    let cancelled = false
    void resolveSession().then((state) => {
      if (!cancelled) setBoot(state)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (boot === "loading") return <AppSplash />
  if (boot === "unreachable") return <AppSplash onRetry={start} />

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </>
  )
}
