import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma";
import { getCache, setCache } from "~/lib/redis";
import { rateLimit } from "~/lib/rate-limiter";

export interface IndexData {
    id: number;
    kode: string;
    nama: string;
}

const CACHE_TTL = 5 * 60; // 5 minutes in seconds
const CACHE_KEY = "index:all";

export async function GET(request: Request) {
    // 1. Apply General Rate Limiter (100 req/min/IP)
    const rateLimitResponse = await rateLimit(request, "general");
    if (rateLimitResponse) return rateLimitResponse;

    try {
        // 2. Check Redis cache first
        const cached = await getCache<IndexData[]>(CACHE_KEY);
        if (cached) {
            return NextResponse.json(cached, {
                headers: {
                    "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
                }
            });
        }

        // Fetch all indices from database, excluding IHSG
        const indices = await prisma.stockIndex.findMany({
            where: {
                kode: {
                    not: "IHSG"
                }
            },
            orderBy: {
                kode: "asc"
            },
            select: {
                id: true,
                kode: true,
                nama: true,
            }
        });

        // Transform to frontend format
        const data: IndexData[] = indices.map(idx => ({
            id: idx.id,
            kode: idx.kode,
            nama: idx.nama,
        }));

        // 3. Cache result in Redis
        await setCache(CACHE_KEY, data, CACHE_TTL);

        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
            }
        });
    } catch (error) {
        console.error("Error fetching indices:", error);
        return NextResponse.json(
            { error: "Failed to fetch indices" },
            { status: 500 }
        );
    }
}
