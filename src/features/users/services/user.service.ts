import { ENDPOINT_SERVER } from "@/config/constant.config"
import { api } from "@/lib/http"
import type { PaginatedResponse, PaginationParams } from "@/shared/interfaces/pagination.interface"
import type { User, UpdateProfilePayload, UserListFilters } from "../interfaces/user.interface"

export const userService = {
  listAll: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get<PaginatedResponse<User>>(ENDPOINT_SERVER.USERS, { params })
    return data
  },

  listStudents: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get<PaginatedResponse<User>>(ENDPOINT_SERVER.USERS_STUDENTS, { params })
    return data
  },

  listTeachers: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get<PaginatedResponse<User>>(ENDPOINT_SERVER.USERS_TEACHERS, { params })
    return data
  },

  listStudentsBySchool: async (schoolId: number, params?: UserListFilters): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get<PaginatedResponse<User>>(
      `${ENDPOINT_SERVER.USERS}/students/by-school/${schoolId}`,
      { params },
    )
    return data
  },

  getById: async (id: number): Promise<User> => {
    const { data } = await api.get<User>(`${ENDPOINT_SERVER.USERS}/${id}`)
    return data
  },

  updateProfile: async (id: number, payload: UpdateProfilePayload): Promise<User> => {
    const { data } = await api.put<User>(`${ENDPOINT_SERVER.USERS}/${id}`, payload)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT_SERVER.USERS}/${id}`)
  },

  activate: async (id: number): Promise<User> => {
    const { data } = await api.patch<User>(`${ENDPOINT_SERVER.USERS}/${id}/activate`)
    return data
  },
}
