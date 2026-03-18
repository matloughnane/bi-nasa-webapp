import { config } from "../../config/index.js";
import { AppCache } from "../../utils/cache.js";
import logger from "../../utils/logger.js";
import { UpstreamError } from "./errors.js";

const cache = new AppCache<unknown>("APOD");

export async function fetchApod(date?: string): Promise<unknown> {
  const cacheKey = date ?? "today";

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const url = new URL("/planetary/apod", config.nasa.baseUrl);
  url.searchParams.set("api_key", config.nasa.apiKey);
  if (date) {
    url.searchParams.set("date", date);
  }

  const start = performance.now();
  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(10_000),
    headers: config.nasa.fetchHeaders,
  });
  const elapsed = performance.now() - start;

  logger.info(`APOD fetch for ${cacheKey} — ${elapsed.toFixed(0)}ms`);

  if (!response.ok) {
    throw new UpstreamError(response.status);
  }

  const data = await response.json();
  cache.set(cacheKey, data);
  return data;
}
