import logger from "./logger.js";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const DEFAULT_TTL = 1000 * 60 * 60 * 6; // 6 hours
const DEFAULT_MAX_SIZE = 256;
const DEFAULT_SWEEP_INTERVAL = 1000 * 60 * 5; // 5 minutes

export class AppCache<T = unknown> {
  private store = new Map<string, CacheEntry<T>>();
  private ttl: number;
  private maxSize: number;
  private name: string;
  private sweepTimer: ReturnType<typeof setInterval> | null = null;

  constructor(name: string, ttl = DEFAULT_TTL, maxSize = DEFAULT_MAX_SIZE) {
    this.name = name;
    this.ttl = ttl;
    this.maxSize = maxSize;

    this.sweepTimer = setInterval(() => this.sweep(), DEFAULT_SWEEP_INTERVAL);
    this.sweepTimer.unref();
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttl) {
      this.store.delete(key);
      return null;
    }
    // Move to end of Map iteration order (most-recently-used)
    this.store.delete(key);
    this.store.set(key, entry);
    logger.info(`${this.name} cache hit for ${key}`);
    return entry.data;
  }

  set(key: string, data: T): void {
    // If key already exists, delete first so it moves to end
    if (this.store.has(key)) {
      this.store.delete(key);
    }
    // Evict least-recently-used entries if at capacity
    while (this.store.size >= this.maxSize) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) {
        this.store.delete(oldest);
      }
    }
    this.store.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.store.clear();
  }

  /** Remove all expired entries proactively. */
  private sweep(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now - entry.timestamp > this.ttl) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.sweepTimer) {
      clearInterval(this.sweepTimer);
      this.sweepTimer = null;
    }
    this.store.clear();
  }
}
