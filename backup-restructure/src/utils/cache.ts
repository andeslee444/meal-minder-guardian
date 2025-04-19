import { logger } from './logger';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private static instance: Cache;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  set<T>(key: string, value: T, ttl: number = this.DEFAULT_TTL): void {
    logger.debug('cache', `Setting cache entry for key: ${key}`, { ttl });
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      logger.debug('cache', `Cache miss for key: ${key}`);
      return null;
    }

    if (this.isExpired(entry)) {
      logger.debug('cache', `Cache entry expired for key: ${key}`);
      this.cache.delete(key);
      return null;
    }

    logger.debug('cache', `Cache hit for key: ${key}`);
    return entry.value as T;
  }

  delete(key: string): void {
    logger.debug('cache', `Deleting cache entry for key: ${key}`);
    this.cache.delete(key);
  }

  clear(): void {
    logger.info('cache', 'Clearing all cache entries');
    this.cache.clear();
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug('cache', `Cleaned up ${cleaned} expired cache entries`);
    }
  }

  getSize(): number {
    return this.cache.size;
  }

  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Method to manually trigger cleanup
  forceCleanup(): void {
    this.cleanup();
  }

  // Method to destroy the cache instance (useful for testing)
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
    // @ts-ignore
    Cache.instance = null;
  }
}

export const cache = Cache.getInstance();
