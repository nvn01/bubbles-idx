import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma";

export interface TickerData {
    symbol: string;
    name: string;
    price: number;
    h: number;  // 1 Hour change %
    d: number;  // 1 Day change %
    w: number;  // 1 Week change %
    m: number;  // 1 Month change %
    y: number;  // 1 Year change %
}

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
        // Optimized query using DISTINCT ON instead of correlated subquery
        // DISTINCT ON (s.id) + ORDER BY s.id, t.ts DESC gives us the latest ticker per stock
        // This is O(n) with the composite index vs O(n²) with the old correlated subquery
        const latestTickers = await prisma.$queryRaw<Array<{
            kode_emiten: string;
            nama_emiten: string;
            price: number;
            h: number | null;
            d: number | null;
            w: number | null;
            m: number | null;
            y: number | null;
        }>>`
            SELECT DISTINCT ON (s.id)
                s.kode_emiten,
                s.nama_emiten,
                t.price,
                t.h,
                t.d,
                t.w,
                t.m,
                t.y
            FROM stocks s
            INNER JOIN ticker t ON s.id = t.stocks_id
            ORDER BY s.id, t.ts DESC
        `;

        // Transform to frontend format
        const data: TickerData[] = latestTickers.map(row => ({
            symbol: row.kode_emiten,
            name: row.nama_emiten,
            price: row.price,
            h: row.h ?? 0,
            d: row.d ?? 0,
            w: row.w ?? 0,
            m: row.m ?? 0,
            y: row.y ?? 0,
        }));

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
