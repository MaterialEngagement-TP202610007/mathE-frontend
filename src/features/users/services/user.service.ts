import { ENDPOINT_SERVER } from "@/config/constant.config"
import { api } from "@/lib/http"
import type { PaginatedResponse } from "@/shared/interfaces/pagination.interface"
import type {
  ActivateUserResponse,
  TeacherListFilters,
  TeacherListItem,
  User,
  UpdateProfilePayload,
  UserListFilters,
} from "../interfaces/user.interface"

export const userService = {
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

  /** Admin only. Paginated teachers, optionally filtered by approval state (`isActive`). */
  listTeachers: async (params?: TeacherListFilters): Promise<PaginatedResponse<TeacherListItem>> => {
    const { data } = await api.get<PaginatedResponse<TeacherListItem>>(ENDPOINT_SERVER.USERS_TEACHERS, {
      params,
    })
    return data
  },

  /** Admin only. Approves a pending teacher account (the backend rejects non-teacher targets). */
  approveTeacher: async (id: number): Promise<User> => {
    const { data } = await api.patch<ActivateUserResponse>(`${ENDPOINT_SERVER.USERS}/${id}/activate`)
    return data.user
  },
}
