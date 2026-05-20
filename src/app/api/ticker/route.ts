import { NextResponse } from "next/server";
import { getLatestTickerData, type TickerData } from "~/lib/ticker";
import { getCache, setCache } from "~/lib/redis";
import { rateLimit } from "~/lib/rate-limiter";

const CACHE_KEY = "ticker:latest";
const CACHE_TTL = 60; // 60 seconds

export async function GET(request: Request) {
    // 1. Apply General Rate Limiter (100 req/min/IP)
    const rateLimitResponse = await rateLimit(request, "general");
    if (rateLimitResponse) return rateLimitResponse;

    try {
        // 2. Try to serve from Redis Cache
        const cached = await getCache<TickerData[]>(CACHE_KEY);
        if (cached) {
            return NextResponse.json(cached, {
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                }
            });
        }

        // 3. Fetch from DB
        const data = await getLatestTickerData();

        // 4. Cache in Redis
        await setCache(CACHE_KEY, data, CACHE_TTL);

        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
            }
        });
    } catch (error) {
        console.error("Error fetching ticker data:", error);
        return NextResponse.json(
            { error: "Failed to fetch ticker data" },
            { status: 500 }
        );
    }
}
