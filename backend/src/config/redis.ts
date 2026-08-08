import Redis, { RedisOptions } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Redis configuration
const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error('❌ Redis connection failed after 3 retries');
      return null;
    }
    return Math.min(times * 200, 2000);
  },
  tls: process.env.REDIS_TLS_ENABLED === 'true' ? {} : undefined,
};

// Create Redis client
// FIX: `new Redis(string | RedisOptions)` doesn't type-check against any of
// ioredis's overloads because the argument type is a union — TypeScript
// needs the branch resolved before picking a constructor signature.
export const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : new Redis(redisOptions);

// Event handlers
redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

redis.on('close', () => {
  console.warn('⚠️  Redis connection closed');
});

// Cache utilities
export const cache = {
  redis, // Expose redis instance for direct access
  
  // Set with expiration (in seconds)
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  },

  // Get and parse
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  },

  // Delete
  async delete(key: string): Promise<number> {
    return await redis.del(key);
  },

  // Check exists
  async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  },

  // Increment (for rate limiting, counters)
  async increment(key: string, ttlSeconds?: number): Promise<number> {
    const count = await redis.incr(key);
    if (ttlSeconds && count === 1) {
      await redis.expire(key, ttlSeconds);
    }
    return count;
  },

  // Pattern matching (use carefully in production)
  async keys(pattern: string): Promise<string[]> {
    return await redis.keys(pattern);
  },

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await redis.ping();
      return true;
    } catch {
      return false;
    }
  },
};

// Cache wrapper for expensive operations
export async function cachedOperation<T>(
  key: string,
  operation: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try cache first
  const cached = await cache.get<T>(key);
  if (cached !== null) {
    console.log(`📦 Cache hit: ${key}`);
    return cached;
  }

  // Execute operation
  console.log(`🔄 Cache miss, executing: ${key}`);
  const result = await operation();

  // Store in cache
  await cache.set(key, result, ttlSeconds);
  return result;
}

export default redis;
