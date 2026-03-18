import { z } from "zod";
import { config } from "../../config/index.js";
import { AppCache } from "../../utils/cache.js";
import logger from "../../utils/logger.js";
import { UpstreamError } from "./errors.js";

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

const nasaNeoSchema = z.object({
  near_earth_objects: z.record(
    z.string(),
    z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        estimated_diameter: z.object({
          kilometers: z.object({
            estimated_diameter_min: z.number(),
            estimated_diameter_max: z.number(),
          }),
        }),
        is_potentially_hazardous_asteroid: z.boolean(),
        close_approach_data: z.array(
          z.object({
            close_approach_date: z.string(),
            miss_distance: z.object({ kilometers: z.string() }),
            relative_velocity: z.object({ kilometers_per_hour: z.string() }),
          }),
        ),
      }),
    ),
  ),
});

const cache = new AppCache<NeoObject[]>("NEO");

export async function fetchNeo(startDate: string, endDate: string): Promise<NeoObject[]> {
  const cacheKey = `${startDate}:${endDate}`;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const url = new URL("/neo/rest/v1/feed", config.nasa.baseUrl);
  url.searchParams.set("api_key", config.nasa.apiKey);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);

  const start = performance.now();
  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(10_000),
    headers: config.nasa.fetchHeaders,
  });
  const elapsed = performance.now() - start;

  logger.info(`NEO fetch for ${cacheKey} — ${elapsed.toFixed(0)}ms`);

  if (!response.ok) {
    throw new UpstreamError(response.status);
  }

  const json = await response.json();
  const parsed = nasaNeoSchema.safeParse(json);
  if (!parsed.success) {
    logger.error("NEO response validation failed", parsed.error);
    throw new Error("Unexpected response from NASA API");
  }

  const flattened = Object.values(parsed.data.near_earth_objects)
    .flat()
    .map((obj) => {
      const approach = obj.close_approach_data[0];
      return {
        id: obj.id,
        name: obj.name,
        estimated_diameter_min_km:
          obj.estimated_diameter.kilometers.estimated_diameter_min,
        estimated_diameter_max_km:
          obj.estimated_diameter.kilometers.estimated_diameter_max,
        miss_distance_km: parseFloat(approach?.miss_distance.kilometers ?? "0"),
        relative_velocity_kmph: parseFloat(
          approach?.relative_velocity.kilometers_per_hour ?? "0",
        ),
        is_potentially_hazardous: obj.is_potentially_hazardous_asteroid,
        close_approach_date: approach?.close_approach_date ?? "",
      };
    })
    .sort((a, b) =>
      a.close_approach_date < b.close_approach_date ? -1
        : a.close_approach_date > b.close_approach_date ? 1
        : 0,
    );

  cache.set(cacheKey, flattened);
  return flattened;
}
