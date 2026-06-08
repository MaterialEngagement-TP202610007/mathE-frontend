import axios, { AxiosError } from "axios"
import { ENV } from "@/config/env.config"

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "HttpError"
  }
}

export const api = axios.create({
  baseURL: ENV.BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(fn: () => void): void {
  onUnauthorized = fn
}

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const status = error.response?.status ?? 0

    if (status === 401) {
      onUnauthorized?.()
    }

    const data = error.response?.data
    const message =
      data?.error || data?.message || error.message || "Request failed"

    return Promise.reject(new HttpError(status, message))
  },
)
