/**
 * Cache item with metadata
 */
interface CacheItem<T> {
  value: T;
  timestamp: number;
  expiry?: number; // Time in milliseconds after which the cache item should be considered stale
}

/**
 * Simple object-based cache with TTL support
 */
export class InMemoryCache {
  private cache: Map<string, { value: any; expires: number }>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Set a value in the cache with optional expiration
   * @param key The cache key
   * @param value The value to store
   * @param ttl Time to live in milliseconds (0 means no expiration)
   */
  set<T>(key: string, value: T, ttl = 0): void {
    const expires = ttl > 0 ? Date.now() + ttl : 0;
    this.cache.set(key, { value, expires });
  }

  /**
   * Get a value from the cache
   * @param key The cache key
   * @returns The cached value, or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);

    // Return undefined if item doesn't exist
    if (!item) return undefined;

    // Check if item has expired
    if (item.expires > 0 && item.expires < Date.now()) {
      this.delete(key);
      return undefined;
    }

    return item.value as T;
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key The cache key
   * @returns True if the key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) return false;

    // Check if item has expired
    if (item.expires > 0 && item.expires < Date.now()) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   * @param key The cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get all keys in the cache
   * @returns Array of cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Remove all expired items from the cache
   */
  prune(): void {
    const now = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.expires > 0 && item.expires < now) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Local storage cache with TTL support
 */
export class LocalStorageCache {
  private prefix: string;

  constructor(prefix = 'app_cache:') {
    this.prefix = prefix;
  }

  /**
   * Set a value in the cache with optional expiration
   * @param key The cache key
   * @param value The value to store
   * @param ttl Time to live in milliseconds (0 means no expiration)
   */
  set<T>(key: string, value: T, ttl = 0): void {
    const expires = ttl > 0 ? Date.now() + ttl : 0;
    const item = { value, expires };

    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.error('LocalStorageCache.set error:', error);
    }
  }

  /**
   * Get a value from the cache
   * @param key The cache key
   * @returns The cached value, or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    try {
      const json = localStorage.getItem(this.prefix + key);

      if (!json) return undefined;

      const item = JSON.parse(json);

      // Check if item has expired
      if (item.expires > 0 && item.expires < Date.now()) {
        this.delete(key);
        return undefined;
      }

      return item.value as T;
    } catch (error) {
      console.error('LocalStorageCache.get error:', error);
      return undefined;
    }
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key The cache key
   * @returns True if the key exists and is not expired
   */
  has(key: string): boolean {
    try {
      const json = localStorage.getItem(this.prefix + key);

      if (!json) return false;

      const item = JSON.parse(json);

      // Check if item has expired
      if (item.expires > 0 && item.expires < Date.now()) {
        this.delete(key);
        return false;
      }

      return true;
    } catch (error) {
      console.error('LocalStorageCache.has error:', error);
      return false;
    }
  }

  /**
   * Delete a key from the cache
   * @param key The cache key
   */
  delete(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('LocalStorageCache.delete error:', error);
    }
  }

  /**
   * Clear all items from the cache with this prefix
   */
  clear(): void {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);

        if (key && key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('LocalStorageCache.clear error:', error);
    }
  }

  /**
   * Get all keys in the cache with this prefix
   * @returns Array of cache keys (without the prefix)
   */
  keys(): string[] {
    try {
      const keys: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith(this.prefix)) {
          keys.push(key.slice(this.prefix.length));
        }
      }

      return keys;
    } catch (error) {
      console.error('LocalStorageCache.keys error:', error);
      return [];
    }
  }

  /**
   * Remove all expired items from the cache with this prefix
   */
  prune(): void {
    try {
      const now = Date.now();

      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);

        if (key && key.startsWith(this.prefix)) {
          const json = localStorage.getItem(key);

          if (json) {
            try {
              const item = JSON.parse(json);

              if (item.expires > 0 && item.expires < now) {
                localStorage.removeItem(key);
              }
            } catch {
              // If we can't parse the item, remove it
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.error('LocalStorageCache.prune error:', error);
    }
  }
}

// For backwards compatibility with old code
export class CacheStorage {
  private prefix: string;
  private defaultTtl: number;
  private cache: LocalStorageCache;

  constructor(prefix: string, defaultTtl = 0) {
    this.prefix = prefix;
    this.defaultTtl = defaultTtl;
    this.cache = new LocalStorageCache(`${prefix}:`);
  }

  setItem<T>(key: string, value: T, ttl = this.defaultTtl): void {
    this.cache.set(key, value, ttl);
  }

  getItem<T>(key: string): T | null {
    return this.cache.get<T>(key) ?? null;
  }

  removeItem(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Export instances
export const memoryCache = new InMemoryCache();
export const localCache = new LocalStorageCache();

// Legacy support
export const imageCache = new CacheStorage('image', 24 * 60 * 60 * 1000); // 24 hours
export const recipeCache = new CacheStorage('recipe', 12 * 60 * 60 * 1000); // 12 hours
export const apiCache = new CacheStorage('api', 30 * 60 * 1000); // 30 minutes

// Default cache (use memory cache)
export const defaultCache = memoryCache;
