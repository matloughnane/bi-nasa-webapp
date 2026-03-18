import axios from "axios"
import type { ApiResponse } from "./api"

export interface NeoObject {
  id: string
  name: string
  estimated_diameter_min_km: number
  estimated_diameter_max_km: number
  miss_distance_km: number
  relative_velocity_kmph: number
  is_potentially_hazardous: boolean
  close_approach_date: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
}

export async function fetchNeo(
  startDate: string,
  endDate: string,
  page: number,
  pageSize: number,
): Promise<PaginatedResponse<NeoObject>> {
  const { data } = await axios.get<ApiResponse<PaginatedResponse<NeoObject>>>("/api/neo", {
    params: {
      start_date: startDate,
      end_date: endDate,
      page: page.toString(),
      page_size: pageSize.toString(),
    },
  })
  if (data.data === null) {
    throw new Error(data.message)
  }
  return data.data
}

export async function fetchNeoAll(
  startDate: string,
  endDate: string,
): Promise<NeoObject[]> {
  const { data } = await axios.get<ApiResponse<PaginatedResponse<NeoObject>>>("/api/neo", {
    params: {
      start_date: startDate,
      end_date: endDate,
    },
  })
  if (data.data === null) {
    throw new Error(data.message)
  }
  return data.data.data
}
