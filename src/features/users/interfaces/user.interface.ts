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

export interface UpdateProfilePayload {
  name?: string
  birthDate?: string
  phoneNumber?: string
  academicGradeId?: number
  schoolId?: number
}
