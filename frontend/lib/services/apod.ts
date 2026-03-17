import axios from "axios"

export interface ApodData {
  title: string
  url: string
  hdurl?: string
  explanation: string
  date: string
  media_type: string
}

export async function fetchApod(date: string): Promise<ApodData> {
  const { data } = await axios.get<ApodData>("/api/apod", {
    params: { date },
  })
  return data
}
