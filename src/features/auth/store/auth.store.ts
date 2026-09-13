import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PublicUser } from "../interfaces/auth.interface"
import { authService } from "../services/auth.service"
import { useQuizStore } from "@/features/quiz/store/quiz.store"
import { useQuizIntroStore } from "@/features/quiz/store/quiz-intro.store"
import { useQuizStatusStore } from "@/features/quiz/store/quiz-status.store"
import { useNotificationStore } from "@/features/notifications/store/notification.store"
import { useQuestionGenerationStore } from "@/features/questions/store/question-generation.store"

/**
 * Wipes every per-user store (and its persisted copy) so a different account
 * signing in on the same browser never inherits the previous user's quiz or
 * notification state. `keepQuiz` preserves the persisted quiz session, which
 * `setSession` still discards if a different account signs in.
 */
function resetUserScopedStores({ keepQuiz = false }: { keepQuiz?: boolean } = {}) {
  if (!keepQuiz) {
    useQuizStore.getState().clearSession()
    useQuizStore.persist.clearStorage()
  }
  useQuizIntroStore.getState().reset()
  useQuizStatusStore.getState().reset()
  useNotificationStore.getState().reset()
  useQuestionGenerationStore.getState().reset()
}

interface AuthState {
  user: PublicUser | null
  roleId: number | null
  isAuthenticated: boolean
  setSession: (user: PublicUser) => void
  /** Explicit sign-out: wipes all per-user state, including an in-progress quiz. */
  clearSession: () => void
  /**
   * Session expired (401): signs out but keeps the persisted quiz so the same
   * student can resume after logging back in.
   */
  expireSession: () => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      roleId: null,
      isAuthenticated: false,

      setSession: (user) => {
        // A persisted quiz from a different account must never leak into this one.
        const previousUserId = get().user?.id
        const quizOwnerId = useQuizStore.getState().session?.studentId
        if (
          (previousUserId !== undefined && previousUserId !== user.id) ||
          (quizOwnerId !== undefined && quizOwnerId !== user.id)
        ) {
          resetUserScopedStores()
        }
        set({
          user,
          roleId: user.roleId ?? null,
          isAuthenticated: true,
        })
      },

      clearSession: () => {
        resetUserScopedStores()
        set({ user: null, roleId: null, isAuthenticated: false })
      },

      expireSession: () => {
        resetUserScopedStores({ keepQuiz: true })
        set({ user: null, roleId: null, isAuthenticated: false })
      },

      logout: async () => {
        try {
          await authService.logout()
        } finally {
          get().clearSession()
        }
      },
    }),
    {
      name: "mathe-auth",
      partialize: (s) => ({
        user: s.user,
        roleId: s.roleId,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
)
