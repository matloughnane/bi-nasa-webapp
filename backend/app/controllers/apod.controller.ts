import type { Request, Response } from "express";
import { config } from "../../config/index.js";
import logger from "../../utils/logger.js";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function getApod(req: Request, res: Response) {
  const { date } = req.query;
  const cacheKey = typeof date === "string" ? date : "today";

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger.info(`APOD cache hit for ${cacheKey}`);
    res.json(cached.data);
    return;
  }

  const url = new URL("/planetary/apod", config.nasa.baseUrl);
  url.searchParams.set("api_key", config.nasa.apiKey);
  if (typeof date === "string") {
    url.searchParams.set("date", date);
  }

  try {
    const start = performance.now();
    const response = await fetch(url.toString());
    const data = await response.json();
    const elapsed = performance.now() - start;

    logger.info(`APOD fetch for ${cacheKey} — ${elapsed.toFixed(0)}ms`);

    if (!response.ok) {
      res.status(response.status).json(data);
      return;
    }

    cache.set(cacheKey, { data, timestamp: Date.now() });
    res.json(data);
  } catch (err) {
    logger.error("APOD fetch failed", err);
    res.status(502).json({ error: "Failed to fetch from NASA API" });
  }
}
