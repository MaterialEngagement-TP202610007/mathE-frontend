import { useState } from "react"
import { HttpError } from "@/lib/http"
import type { RegisterPayload, RegisterResponse } from "../interfaces/auth.interface"
import { authService } from "../services/auth.service"

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [response, setResponse] = useState<RegisterResponse | null>(null)

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true)
    setError(null)
    try {
      setResponse(await authService.register(payload))
      setIsSuccess(true)
    } catch (e) {
      setError(
        e instanceof HttpError
          ? e.message
          : "No se pudo completar el registro. Inténtalo de nuevo.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return { register, isLoading, error, isSuccess, response }
}
