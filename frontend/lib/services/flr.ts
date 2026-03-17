import axios from "axios"

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

export async function fetchFlr(
  startDate: string,
  endDate: string,
): Promise<FlrEvent[]> {
  const { data } = await axios.get<FlrEvent[]>("/api/flr", {
    params: { start_date: startDate, end_date: endDate },
  })
  return data
}
