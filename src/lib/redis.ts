import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redis: Redis | null = null;
let redisPub: Redis | null = null;
let redisSub: Redis | null = null;

// Initialize Redis client with connection error catching
function getRedisClient(): Redis {
    if (redis) return redis;

    console.log(`[Redis] Connecting to ${REDIS_URL}`);
    redis = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            // Wait max 2 seconds between retries
            const delay = Math.min(times * 100, 2000);
            return delay;
        },
    });

    redis.on("error", (err) => {
        console.error("[Redis] Client Error:", err.message);
    });

    redis.on("connect", () => {
        console.log("[Redis] Connected successfully");
    });

    return redis;
}

// Get Publisher client
export function getRedisPub(): Redis {
    if (redisPub) return redisPub;

    redisPub = new Redis(REDIS_URL, {
        maxRetriesPerRequest: null,
    });
    redisPub.on("error", (err) => {
        console.error("[Redis Pub] Error:", err.message);
    });
    return redisPub;
}

// Get Subscriber client
export function getRedisSub(): Redis {
    if (redisSub) return redisSub;

    redisSub = new Redis(REDIS_URL, {
        maxRetriesPerRequest: null,
    });
    redisSub.on("error", (err) => {
        console.error("[Redis Sub] Error:", err.message);
    });
    return redisSub;
}

// Singleton Redis Instance Export
export const redisClient = getRedisClient();

// --- JSON Caching Helper Functions ---

/**
 * Fetch a cached item from Redis, parsing it back to JSON.
 * Gracefully returns null on cache miss or if Redis is unavailable.
 */
export async function getCache<T>(key: string): Promise<T | null> {
    try {
        const data = await redisClient.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
    } catch (error) {
        console.error(`[Redis Cache] GET error for key "${key}":`, error);
        return null; // Graceful DB fallback
    }
}

/**
 * Set an item in the Redis cache, converting it to a JSON string.
 * Gracefully ignores errors if Redis is unavailable.
 */
export async function setCache(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
        const jsonStr = JSON.stringify(value);
        await redisClient.set(key, jsonStr, "EX", ttlSeconds);
    } catch (error) {
        console.error(`[Redis Cache] SET error for key "${key}":`, error);
    }
}

/**
 * Invalidate a key in the Redis cache.
 * Gracefully ignores errors if Redis is unavailable.
 */
export async function delCache(key: string): Promise<void> {
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error(`[Redis Cache] DEL error for key "${key}":`, error);
    }
}
