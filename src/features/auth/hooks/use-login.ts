import { useState } from "react"
import { useNavigate } from "react-router"
import { ROUTING } from "@/config/constant.config"
import { HttpError } from "@/lib/http"
import type { LoginCredentials } from "../interfaces/auth.interface"
import { authService } from "../services/auth.service"
import { useAuthStore } from "../store/auth.store"

export function useLogin() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    setError(null)
    try {
      const { user } = await authService.login(credentials)
      setSession(user)
      navigate(ROUTING.DASHBOARD, { replace: true })
    } catch (e) {
      // 401 here usually means bad credentials OR an inactive student account.
      setError(
        e instanceof HttpError
          ? e.message
          : "No se pudo iniciar sesión. Inténtalo de nuevo.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return { login, isLoading, error }
}
