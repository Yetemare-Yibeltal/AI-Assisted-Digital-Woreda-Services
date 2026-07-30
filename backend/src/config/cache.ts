interface CacheConfig {
  ttl: number; // default TTL in seconds
  maxSize: number; // maximum number of entries
  checkPeriod: number; // cleanup interval in seconds
}

const cacheConfig: CacheConfig = {
  ttl: 300,
  maxSize: 1000,
  checkPeriod: 60,
};

export default cacheConfig;
