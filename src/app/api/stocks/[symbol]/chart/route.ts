import { NextResponse } from "next/server"
import { prisma } from "~/lib/prisma"
import { getCache, setCache } from "~/lib/redis"
import { rateLimit } from "~/lib/rate-limiter"

const CACHE_TTL = 30; // 30 seconds for chart data

export async function GET(
    request: Request,
    props: { params: Promise<{ symbol: string }> }
) {
    // 1. Apply General Rate Limiter (100 req/min/IP)
    const rateLimitResponse = await rateLimit(request, "general");
    if (rateLimitResponse) return rateLimitResponse;

    const params = await props.params
    const symbol = params.symbol.toUpperCase()
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "1D"

    const cacheKey = `chart:${symbol}:${range}`

    try {
        // 2. Check Redis cache
        const cached = await getCache<any[]>(cacheKey)
        if (cached) {
            return NextResponse.json(cached)
        }

        const now = new Date()
        let startDate = new Date()

        switch (range) {
            case "1H": // Last hour
                startDate.setHours(now.getHours() - 1)
                break
            case "1D": // Last 24 hours of trading
                startDate.setDate(now.getDate() - 1)
                break
            case "1W":
                startDate.setDate(now.getDate() - 7)
                break
            case "1M":
                startDate.setMonth(now.getMonth() - 1)
                break
            case "3M":
                startDate.setMonth(now.getMonth() - 3)
                break
            case "1Y":
                startDate.setFullYear(now.getFullYear() - 1)
                break
            case "5Y":
                startDate.setFullYear(now.getFullYear() - 5)
                break
            default: // Default to 1D
                startDate.setDate(now.getDate() - 1)
        }

        // Fetch ticker history with limited fields
        const tickers = await prisma.ticker.findMany({
            where: {
                stock: { kode_emiten: symbol },
                ts: { gte: startDate }
            },
            orderBy: { ts: "asc" },
            select: {
                ts: true,
                price: true
            }
        })

        const data = tickers.map(t => ({
            time: t.ts.toISOString(),
            value: t.price
        }))

        // 3. Cache result in Redis
        await setCache(cacheKey, data, CACHE_TTL)

        return NextResponse.json(data)
    } catch (error) {
        console.error("Chart API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
