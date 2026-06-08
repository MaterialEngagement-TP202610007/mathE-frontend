export interface PublicUser {
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

export interface LoginResponse {
  user: PublicUser
}

export interface MeResponse {
  user: PublicUser
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  name: string
  birthDate: string
  roleId: number
  phoneNumber?: string
  schoolId?: number
  academicGradeId?: number
}
