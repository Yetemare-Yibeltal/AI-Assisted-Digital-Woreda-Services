import logger from "../utils/logger";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  evictions: number;
  keys: string[];
}

class CacheService {
  private store: Map<string, CacheEntry<any>>;
  private defaultTTL: number;
  private maxSize: number;
  private hits: number;
  private misses: number;
  private evictions: number;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor(defaultTTL: number = 300000, maxSize: number = 1000) {
    this.store = new Map();
    this.defaultTTL = defaultTTL;
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.cleanupInterval = null;
    this.startCleanup();
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanExpired();
    }, 60000);

    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  private cleanExpired(): void {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt <= now) {
        this.store.delete(key);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      logger.debug(`Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.store.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
      this.evictions++;
    }
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const effectiveTTL = ttl || this.defaultTTL;

    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      this.evictOldest();
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + effectiveTTL,
      createdAt: Date.now(),
      hits: 0,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      this.misses++;
      return null;
    }

    entry.hits++;
    this.hits++;
    return entry.value as T;
  }

  getOrSet<T>(key: string, factory: () => T | Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return Promise.resolve(cached);
    }

    const result = factory();
    if (result instanceof Promise) {
      return result.then((value) => {
        this.set(key, value, ttl);
        return value;
      });
    }

    this.set(key, result, ttl);
    return Promise.resolve(result);
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  deletePattern(pattern: string): number {
    let deleted = 0;
    const regex = new RegExp(pattern);
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        deleted++;
      }
    }
    return deleted;
  }

  clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  getStats(): CacheStats {
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      keys: Array.from(this.store.keys()),
    };
  }

  invalidateServiceCache(): void {
    this.deletePattern("services:");
    this.deletePattern("service:");
    this.deletePattern("categories");
    this.deletePattern("popular:");
    logger.info("Service cache invalidated");
  }

  invalidateApplicationCache(): void {
    this.deletePattern("applications:");
    this.deletePattern("application:");
    this.deletePattern("stats:");
    this.deletePattern("tracking:");
    logger.info("Application cache invalidated");
  }

  invalidateAdminCache(): void {
    this.deletePattern("admins:");
    this.deletePattern("admin:");
    this.deletePattern("permissions:");
    logger.info("Admin cache invalidated");
  }

  invalidateAICache(): void {
    this.deletePattern("ai:");
    this.deletePattern("chat:");
    this.deletePattern("recommendation:");
    this.deletePattern("translation:");
    logger.info("AI cache invalidated");
  }

  invalidateAll(): void {
    this.clear();
    logger.info("All cache invalidated");
  }

  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

const cacheService = new CacheService(300000, 1000);

export { CacheService, cacheService };
export default cacheService;
