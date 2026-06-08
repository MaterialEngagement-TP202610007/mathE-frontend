import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PublicUser } from "../interfaces/auth.interface"
import { authService } from "../services/auth.service"

interface AuthState {
  user: PublicUser | null
  roleId: number | null
  isAuthenticated: boolean
  setSession: (user: PublicUser) => void
  clearSession: () => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      roleId: null,
      isAuthenticated: false,

      setSession: (user) =>
        set({
          user,
          roleId: user.roleId ?? null,
          isAuthenticated: true,
        }),

      clearSession: () =>
        set({ user: null, roleId: null, isAuthenticated: false }),

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
