export interface User {
  id: number
  email: string
  name: string
  birthDate: string
  createdAt: string
  updatedAt: string
  phoneNumber: string | null
  isActive: boolean
  roleId: number | null
  academicGradeId: number | null
  schoolId: number | null
  deletedAt: string | null
}

export interface UserSchoolRef {
  id: number
  name: string | null
}

/** Item of `GET /users/teachers`: flat `schoolId` plus the nested school reference. */
export interface TeacherListItem extends User {
  school?: UserSchoolRef | null
  /** Legacy flat school name, used as a fallback when `school` is absent. */
  schoolName?: string | null
}

export interface TeacherListFilters {
  page?: number
  limit?: number
  isActive?: boolean
}

export interface ActivateUserResponse {
  message: string
  user: User
}

export interface UpdateProfilePayload {
  name?: string
  birthDate?: string
  /** `null` clears the stored phone number. */
  phoneNumber?: string | null
  academicGradeId?: number
  schoolId?: number
}

export interface UserListFilters {
  page?: number
  limit?: number
  isActive?: boolean
  academicGradeId?: number
  birthDateFrom?: string
  birthDateTo?: string
  createdAtFrom?: string
  createdAtTo?: string
}
