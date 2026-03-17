import type { Request, Response } from "express";
import { config } from "../../config/index.js";
import logger from "../../utils/logger.js";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

interface NasaNeoResponse {
  near_earth_objects: Record<
    string,
    {
      id: string;
      name: string;
      estimated_diameter: {
        kilometers: {
          estimated_diameter_min: number;
          estimated_diameter_max: number;
        };
      };
      is_potentially_hazardous_asteroid: boolean;
      close_approach_data: {
        close_approach_date: string;
        miss_distance: { kilometers: string };
        relative_velocity: { kilometers_per_hour: string };
      }[];
    }[]
  >;
}

export async function getNeo(req: Request, res: Response) {
  const { start_date, end_date } = req.query;
  const cacheKey = `${start_date}:${end_date}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger.info(`NEO cache hit for ${cacheKey}`);
    res.json(cached.data);
    return;
  }

  const url = new URL("/neo/rest/v1/feed", config.nasa.baseUrl);
  url.searchParams.set("api_key", config.nasa.apiKey);
  url.searchParams.set("start_date", start_date as string);
  url.searchParams.set("end_date", end_date as string);

  try {
    const start = performance.now();
    const response = await fetch(url.toString());
    const raw = (await response.json()) as NasaNeoResponse;
    const elapsed = performance.now() - start;

    logger.info(`NEO fetch for ${cacheKey} — ${elapsed.toFixed(0)}ms`);

    if (!response.ok) {
      res.status(response.status).json(raw);
      return;
    }

    const flattened = Object.values(raw.near_earth_objects)
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
      });

    cache.set(cacheKey, { data: flattened, timestamp: Date.now() });
    res.json(flattened);
  } catch (err) {
    logger.error("NEO fetch failed", err);
    res.status(502).json({ error: "Failed to fetch from NASA API" });
  }
}
