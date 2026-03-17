import axios from "axios";

export interface NeoObject {
  id: string;
  name: string;
  estimated_diameter_min_km: number;
  estimated_diameter_max_km: number;
  miss_distance_km: number;
  relative_velocity_kmph: number;
  is_potentially_hazardous: boolean;
  close_approach_date: string;
}

export async function fetchNeo(
  startDate: string,
  endDate: string,
): Promise<NeoObject[]> {
  const { data } = await axios.get<NeoObject[]>("/api/neo", {
    params: { start_date: startDate, end_date: endDate },
  });
  return data;
}
