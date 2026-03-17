import type { Request, Response } from "express";
import { config } from "../../config/index.js";
import logger from "../../utils/logger.js";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

interface NasaFlrEvent {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime: string | null;
  classType: string;
  sourceLocation: string;
  activeRegionNum: number | null;
  note: string;
  linkedEvents: { activityID: string }[] | null;
  link: string;
}

export async function getFlr(req: Request, res: Response) {
  const { start_date, end_date } = req.query;
  const cacheKey = `${start_date}:${end_date}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger.info(`FLR cache hit for ${cacheKey}`);
    res.json(cached.data);
    return;
  }

  const url = new URL("/DONKI/FLR", config.nasa.baseUrl);
  url.searchParams.set("api_key", config.nasa.apiKey);
  url.searchParams.set("startDate", start_date as string);
  url.searchParams.set("endDate", end_date as string);

  try {
    const start = performance.now();
    const response = await fetch(url.toString());
    const raw = await response.json();
    const elapsed = performance.now() - start;

    logger.info(`FLR fetch for ${cacheKey} — ${elapsed.toFixed(0)}ms`);

    if (!response.ok) {
      res.status(response.status).json(raw);
      return;
    }

    const flattened = (raw as NasaFlrEvent[]).map((event) => ({
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

    cache.set(cacheKey, { data: flattened, timestamp: Date.now() });
    res.json(flattened);
  } catch (err) {
    logger.error("FLR fetch failed", err);
    res.status(502).json({ error: "Failed to fetch from NASA API" });
  }
}
