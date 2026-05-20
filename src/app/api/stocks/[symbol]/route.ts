import { NextResponse } from "next/server"
import { prisma } from "~/lib/prisma"
import { getCache, setCache } from "~/lib/redis"
import { rateLimit } from "~/lib/rate-limiter"

const CACHE_TTL = 15; // 15 seconds - shorter for real-time data

export async function GET(
    request: Request,
    props: { params: Promise<{ symbol: string }> }
) {
    // 1. Apply General Rate Limiter (100 req/min/IP)
    const rateLimitResponse = await rateLimit(request, "general");
    if (rateLimitResponse) return rateLimitResponse;

    const params = await props.params
    const symbol = params.symbol.toUpperCase()
    const cacheKey = `stock:${symbol}`

    try {
        // 2. Check Redis cache
        const cached = await getCache<any>(cacheKey)
        if (cached) {
            return NextResponse.json(cached)
        }

        const stock = await prisma.stock.findUnique({
            where: { kode_emiten: symbol },
            include: {
                notations: { select: { kode: true } },
                indices: true,
                tickers: {
                    orderBy: { ts: "desc" },
                    take: 1
                }
            }
        })

        if (!stock) {
            return NextResponse.json({ error: "Stock not found" }, { status: 404 })
        }

        const latestTicker = stock.tickers[0]
        const isSuspended = stock.is_suspended

        // Format data for frontend
        const data = {
            symbol: stock.kode_emiten,
            name: stock.nama_emiten,
            // Suspended stocks have no active trading — zero out price/change
            price: isSuspended ? 0 : (latestTicker?.price || 0),
            change: isSuspended ? 0 : (latestTicker?.d || 0), // Daily change as primary
            is_suspended: isSuspended,
            listingDate: stock.tanggal_pencatatan,
            notations: stock.notations.map(n => n.kode),
            indices: stock.indices.map(i => ({ kode: i.kode, nama: i.nama })),
            // Performance metrics — all zero for suspended stocks
            changes: {
                h: isSuspended ? 0 : (latestTicker?.h || 0),
                d: isSuspended ? 0 : (latestTicker?.d || 0),
                w: isSuspended ? 0 : (latestTicker?.w || 0),
                m: isSuspended ? 0 : (latestTicker?.m || 0),
                y: isSuspended ? 0 : (latestTicker?.y || 0),
            }
        }

        // 3. Cache result in Redis
        await setCache(cacheKey, data, CACHE_TTL)

        return NextResponse.json(data)
    } catch (error) {
        console.error("Stock Details API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
