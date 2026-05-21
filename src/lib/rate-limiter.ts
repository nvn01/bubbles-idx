import { NextResponse } from "next/server";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { redisClient } from "./redis";

// Define Rate Limit policies
const GENERAL_LIMIT = 100; // 100 req
const GENERAL_DURATION = 60; // per 60 seconds

const SEARCH_LIMIT = 20; // 20 req
const SEARCH_DURATION = 60; // per 60 seconds

const MAX_SSE_CONNS_PER_IP = 3; // Max 3 concurrent SSE streams per IP

// 1. General Limiter
const generalLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "rl:general",
    points: GENERAL_LIMIT,
    duration: GENERAL_DURATION,
});

// 2. Search Limiter
const searchLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "rl:search",
    points: SEARCH_LIMIT,
    duration: SEARCH_DURATION,
});

/**
 * Extracts the client's canonical IP address from request headers securely.
 */
export function getClientIp(request: Request): string {
    // 1. Trust Cloudflare client IP in production
    const cfIp = request.headers.get("cf-connecting-ip");
    if (cfIp) return cfIp;

    // 2. Fallbacks for local development / internal staging
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0]?.trim() || "127.0.0.1";
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp) return realIp;

    return "127.0.0.1";
}

/**
 * Enforce rate limits per IP. 
 * Returns a 429 response if blocked, otherwise returns null (allowed).
 */
export async function rateLimit(
    request: Request,
    type: "general" | "search" | "sse"
): Promise<NextResponse | null> {
    const ip = getClientIp(request);

    // Skip rate limiting if Redis is down/unavailable
    if (redisClient.status !== "ready") {
        console.warn(`[Rate Limiter] Redis not ready (status: ${redisClient.status}). Skipping check.`);
        return null;
    }

    try {
        // Check if this IP has successfully solved Turnstile recently
        const isWhitelisted = await redisClient.get(`turnstile_passed:${ip}`);
        if (isWhitelisted) {
            console.log(`[Rate Limiter] IP ${ip} is whitelisted via Turnstile. Bypassing check.`);
            return null; // Allowed!
        }

        if (type === "general") {
            const res = await generalLimiter.consume(ip, 1);
            return null; // Allowed
        }

        if (type === "search") {
            const res = await searchLimiter.consume(ip, 1);
            return null; // Allowed
        }

        if (type === "sse") {
            // Concurrent connection limit check using Redis atomic INCR
            const key = `rl:sse:active:${ip}`;
            const activeConnections = await redisClient.incr(key);

            // Set a self-healing TTL of 60 seconds (so connection counts don't leak on crash)
            await redisClient.expire(key, 60);

            if (activeConnections > MAX_SSE_CONNS_PER_IP) {
                // If blocked, immediately decrement back to avoid permanently blocking the user
                await redisClient.decr(key);
                
                console.warn(`[Rate Limiter] Blocked SSE connection for ${ip} (concurrent limit: ${activeConnections}/${MAX_SSE_CONNS_PER_IP})`);
                return new NextResponse(
                    JSON.stringify({ 
                        error: "Too many concurrent stream connections. Capped at 3.",
                        turnstileRequired: true
                    }),
                    {
                        status: 429,
                        headers: {
                            "Content-Type": "application/json",
                            "Retry-After": "60",
                        },
                    }
                );
            }

            return null; // Allowed
        }

        return null;
    } catch (error: any) {
        // rate-limiter-flexible throws the rateLimiterRes object if rate limit is exceeded!
        if (error && error.msBeforeNext !== undefined) {
            const limit = type === "search" ? SEARCH_LIMIT : GENERAL_LIMIT;
            const retryAfter = Math.ceil(error.msBeforeNext / 1000);

            return new NextResponse(
                JSON.stringify({ 
                    error: "Too many requests. Please verify you are human.",
                    turnstileRequired: true
                }),
                {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        "Retry-After": String(retryAfter),
                        "X-RateLimit-Limit": String(limit),
                        "X-RateLimit-Remaining": "0",
                    },
                }
            );
        }

        // Catch other unexpected errors (e.g. Redis timeouts) gracefully
        console.error(`[Rate Limiter] Error during ${type} check for ${ip}:`, error);
        return null; // Fail-open to preserve availability
    }
}

/**
 * Decrement the active SSE connection counter for an IP.
 * Used when a client disconnects to release their connection slot.
 */
export async function decrementActiveSSE(ip: string): Promise<void> {
    try {
        const key = `rl:sse:active:${ip}`;
        const active = await redisClient.decr(key);
        if (active <= 0) {
            await redisClient.del(key);
        }
    } catch (error) {
        console.error(`[Rate Limiter] Error decrementing SSE count for ${ip}:`, error);
    }
}

/**
 * Extend the lease/TTL of the SSE active connection count.
 * Keeps connection records fresh for live connections.
 */
export async function keepAliveActiveSSE(ip: string): Promise<void> {
    try {
        const key = `rl:sse:active:${ip}`;
        await redisClient.expire(key, 60);
    } catch (error) {
        console.error(`[Rate Limiter] Error extending SSE TTL for ${ip}:`, error);
    }
}
