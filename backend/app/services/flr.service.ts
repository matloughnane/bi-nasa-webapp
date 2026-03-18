import { z } from "zod";
import { config } from "../../config/index.js";
import { AppCache } from "../../utils/cache.js";
import logger from "../../utils/logger.js";
import { UpstreamError } from "./errors.js";

export interface FlrObject {
  id: string;
  begin_time: string;
  peak_time: string;
  end_time: string | null;
  class_type: string;
  source_location: string;
  active_region_num: number | null;
  linked_events: number;
  link: string;
}

const nasaFlrSchema = z.array(
  z.object({
    flrID: z.string(),
    beginTime: z.string(),
    peakTime: z.string(),
    endTime: z.string().nullable(),
    classType: z.string(),
    sourceLocation: z.string(),
    activeRegionNum: z.number().nullable(),
    note: z.string(),
    linkedEvents: z.array(z.object({ activityID: z.string() })).nullable(),
    link: z.string(),
  }),
);

const cache = new AppCache<FlrObject[]>("FLR");

export async function fetchFlr(startDate: string, endDate: string): Promise<FlrObject[]> {
  const cacheKey = `${startDate}:${endDate}`;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const url = new URL("/DONKI/FLR", config.nasa.baseUrl);
  url.searchParams.set("api_key", config.nasa.apiKey);
  url.searchParams.set("startDate", startDate);
  url.searchParams.set("endDate", endDate);

  const start = performance.now();
  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(10_000),
    headers: config.nasa.fetchHeaders,
  });
  const elapsed = performance.now() - start;

  logger.info(`FLR fetch for ${cacheKey} — ${elapsed.toFixed(0)}ms`);

  if (!response.ok) {
    throw new UpstreamError(response.status);
  }

  const json = await response.json();
  const parsed = nasaFlrSchema.safeParse(json);
  if (!parsed.success) {
    logger.error("FLR response validation failed", parsed.error);
    throw new Error("Unexpected response from NASA API");
  }

  const flattened = parsed.data.map((event) => ({
    id: event.flrID,
    begin_time: event.beginTime,
    peak_time: event.peakTime,
    end_time: event.endTime,
    class_type: event.classType,
    source_location: event.sourceLocation,
    active_region_num: event.activeRegionNum,
    linked_events: event.linkedEvents?.length ?? 0,
    link: event.link,
  }));

  cache.set(cacheKey, flattened);
  return flattened;
}
