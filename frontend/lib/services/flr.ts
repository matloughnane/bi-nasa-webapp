import axios from "axios"
import type { ApiResponse } from "./api"

export interface FlrEvent {
  id: string
  begin_time: string
  peak_time: string
  end_time: string | null
  class_type: string
  source_location: string
  active_region_num: number | null
  linked_events: number
  link: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
}

export async function fetchFlr(
  startDate: string,
  endDate: string,
  page: number,
  pageSize: number,
): Promise<PaginatedResponse<FlrEvent>> {
  const { data } = await axios.get<ApiResponse<PaginatedResponse<FlrEvent>>>("/api/flr", {
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
