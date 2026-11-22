import { ENDPOINT_SERVER } from "@/config/constant.config"
import { api, setUnauthorizedHandler } from "@/lib/http"
import type {
  LoginCredentials,
  LoginResponse,
  MeResponse,
  RegisterPayload,
  RegisterResponse,
} from "../interfaces/auth.interface"

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await api.post<LoginResponse>(
      ENDPOINT_SERVER.AUTH_LOGIN,
      credentials,
    )
    return data;
  },

  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<RegisterResponse>(
      ENDPOINT_SERVER.AUTH_REGISTER,
      payload,
    )
    return data;
  },

  verifyEmail: async (email: string, code: string) => {
    await api.post(ENDPOINT_SERVER.AUTH_VERIFY_EMAIL, { email, code })
  },

  resendVerificationCode: async (email: string) => {
    await api.post(ENDPOINT_SERVER.AUTH_VERIFY_EMAIL_RESEND, { email })
  },

  logout: async () => {
    await api.post(ENDPOINT_SERVER.AUTH_LOGOUT)
  },

  me: async () => {
    const { data } = await api.get<MeResponse>(ENDPOINT_SERVER.AUTH_ME)
    return data;
  },

  onUnauthorized: (fn: () => void) => setUnauthorizedHandler(fn),
};
