import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma";
import { getCache, setCache } from "~/lib/redis";
import { rateLimit } from "~/lib/rate-limiter";

interface RouteParams {
    params: Promise<{ kode: string }>;
}

const CACHE_TTL = 5 * 60; // 5 minutes in seconds

export async function GET(request: Request, { params }: RouteParams) {
    // 1. Apply General Rate Limiter (100 req/min/IP)
    const rateLimitResponse = await rateLimit(request, "general");
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const { kode } = await params;
        const indexKode = kode.toUpperCase();
        const cacheKey = `index:${indexKode}`;

        // 2. Check Redis cache
        const cached = await getCache<any>(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // Find the index by kode and include its stocks (many-to-many relation)
        const stockIndex = await prisma.stockIndex.findFirst({
            where: {
                kode: indexKode
            },
            include: {
                stocks: {
                    select: {
                        kode_emiten: true,
                        nama_emiten: true,
                    }
                }
            }
        });

        if (!stockIndex) {
            return NextResponse.json(
                { error: `Index ${indexKode} not found` },
                { status: 404 }
            );
        }

        // Extract stock symbols from the stocks relation
        const symbols = stockIndex.stocks
            .map(s => s.kode_emiten)
            .filter(Boolean)
            .sort();

        const data = {
            kode: stockIndex.kode,
            nama: stockIndex.nama,
            symbols: symbols,
        };

        // 3. Cache result in Redis
        await setCache(cacheKey, data, CACHE_TTL);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching index stocks:", error);
        return NextResponse.json(
            { error: "Failed to fetch index stocks" },
            { status: 500 }
        );
    }
}
