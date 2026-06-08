import { ENDPOINT_SERVER } from "@/config/constant.config"
import { api, setUnauthorizedHandler } from "@/lib/http"
import type {
  LoginCredentials,
  LoginResponse,
  MeResponse,
  RegisterPayload,
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
    const { data } = await api.post<{ message: string }>(
      ENDPOINT_SERVER.AUTH_REGISTER,
      payload,
    )
    return data;
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
