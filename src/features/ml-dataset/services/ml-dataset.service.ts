import { ENDPOINT_SERVER } from "@/config/constant.config"
import { api } from "@/lib/http"
import type { PaginatedResponse } from "@/shared/interfaces/pagination.interface"
import type { MlDatasetEntry, ListDatasetParams } from "../interfaces/ml-dataset.interface"

export const mlDatasetService = {
  list: async (params?: ListDatasetParams): Promise<PaginatedResponse<MlDatasetEntry>> => {
    const { data } = await api.get<PaginatedResponse<MlDatasetEntry>>(ENDPOINT_SERVER.ML_DATASET, { params })
    return data
  },

  getById: async (id: number): Promise<MlDatasetEntry> => {
    const { data } = await api.get<MlDatasetEntry>(`${ENDPOINT_SERVER.ML_DATASET}/${id}`)
    return data
  },
}
