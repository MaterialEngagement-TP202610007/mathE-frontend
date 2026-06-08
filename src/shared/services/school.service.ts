import { ENDPOINT_SERVER } from "@/config/constant.config"
import { api } from "@/lib/http"
import type { Paginated } from "../interfaces"

export interface School {
  id: number
  cenEdu: string
  address: string
  conMod: string
  level: string
  district: string
  businessName: string
  createdAt: string
  updatedAt: string
}

export interface ListSchoolsParams {
  page?: number
  limit?: number
  search?: string
}

export async function listSchools(
  params: ListSchoolsParams = {},
): Promise<Paginated<School>> {
  const { data } = await api.get<Paginated<School>>(ENDPOINT_SERVER.SCHOOLS, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      ...(params.search ? { search: params.search } : {}),
    },
  })
  return data
}

export async function getSchoolById(id: number): Promise<School> {
  const { data } = await api.get<School>(`${ENDPOINT_SERVER.SCHOOLS}/${id}`)
  return data
}
