import axios from "axios"
import type { ApiResponse } from "./api"

export interface ApodData {
  title: string
  url: string
  hdurl?: string
  explanation: string
  date: string
  media_type: string
}

export async function fetchApod(date: string): Promise<ApodData> {
  const { data } = await axios.get<ApiResponse<ApodData>>("/api/apod", {
    params: { date },
  })
  if (data.data === null) {
    throw new Error(data.message)
  }
  return data.data
}
