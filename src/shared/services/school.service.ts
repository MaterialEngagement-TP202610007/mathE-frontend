import { ENDPOINT_SERVER } from "@/config/constant.config"
import { api } from "@/lib/http"
import type { Paginated } from "../interfaces"

/** One real school. MINEDU rows sharing an institution are merged backend-side. */
export interface School {
  id: number
  institutionKey: string
  cenEdu: string
  district: string
  address: string
  businessName: string
  /** Education levels offered, e.g. `["Primaria", "Secundaria"]`. */
  levels: string[]
  codMods: string[]
  createdAt: string
  updatedAt: string
}

/** Backend caps `limit` at 50 for `GET /schools`. */
export const MAX_SCHOOLS_PAGE_SIZE = 50

/** Human label for the levels a school offers, e.g. "Primaria · Secundaria". */
export function formatSchoolLevels(levels: readonly string[] | null | undefined): string {
  return (levels ?? []).filter(Boolean).join(" · ")
}

/** Name plus district, so homonymous schools in different districts stay distinguishable. */
export function formatSchoolLabel(school: Pick<School, "cenEdu" | "district">): string {
  return [school.cenEdu, school.district].filter(Boolean).join(" · ")
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
      limit: Math.min(params.limit ?? 20, MAX_SCHOOLS_PAGE_SIZE),
      ...(params.search ? { search: params.search } : {}),
    },
  })
  return data
}

export async function getSchoolById(id: number): Promise<School> {
  const { data } = await api.get<School>(`${ENDPOINT_SERVER.SCHOOLS}/${id}`)
  return data
}
