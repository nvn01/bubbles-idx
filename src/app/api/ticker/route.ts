import { NextResponse } from "next/server";
import { getLatestTickerData, type TickerData } from "~/lib/ticker";

// In-memory cache for ticker data (data only changes every ~10 minutes)
let tickerCache: { data: TickerData[]; timestamp: number } | null = null;
const CACHE_TTL = 60000; // 60 seconds

export async function GET() {
    // Return cached data if fresh
    if (tickerCache && Date.now() - tickerCache.timestamp < CACHE_TTL) {
        return NextResponse.json(tickerCache.data, {
            headers: {
                "Cache-Control": "s-maxage=60, stale-while-revalidate=30",
            }
        });
    }

    try {
        const data = await getLatestTickerData();

        // Cache result
        tickerCache = { data, timestamp: Date.now() };

        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "s-maxage=60, stale-while-revalidate=30",
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
