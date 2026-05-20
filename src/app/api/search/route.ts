import { NextResponse } from "next/server"
import { prisma } from "~/lib/prisma"
import { Prisma } from "@prisma/client"
import { getCache, setCache } from "~/lib/redis"
import { rateLimit } from "~/lib/rate-limiter"

const CACHE_TTL = 30; // 30 seconds

export async function GET(request: Request) {
    // 1. Apply Search Rate Limiter (20 req/min/IP)
    const rateLimitResponse = await rateLimit(request, "search");
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")

    if (!q || q.length < 2) {
        return NextResponse.json([])
    }

    const searchTerm = q.toUpperCase()
    const cacheKey = `search:${searchTerm}`

    try {
        // 2. Check Redis cache first
        const cached = await getCache<any[]>(cacheKey)
        if (cached) {
            return NextResponse.json(cached)
        }

        const likeTerm = `%${searchTerm}%`
        const startsWithTerm = `${searchTerm}%`

        // 3. Explicitly hardened parameterized SQL using Prisma.sql
        const query = Prisma.sql`
            SELECT 
                s.kode_emiten,
                s.nama_emiten,
                s.is_suspended,
                COALESCE(lt.d, 0) as d,
                COALESCE(lt.price, 0) as price,
                CASE 
                    WHEN s.kode_emiten ILIKE ${startsWithTerm} THEN 1
                    WHEN s.kode_emiten ILIKE ${likeTerm} THEN 2
                    ELSE 3
                END as priority
            FROM stocks s
            LEFT JOIN LATERAL (
                SELECT t.price, t.d
                FROM ticker t
                WHERE t.stocks_id = s.id
                ORDER BY t.ts DESC
                LIMIT 1
            ) lt ON true
            WHERE 
                s.kode_emiten ILIKE ${likeTerm}
                OR s.nama_emiten ILIKE ${likeTerm}
            ORDER BY priority, s.kode_emiten
            LIMIT 50
        `

        const stocks = await prisma.$queryRaw<Array<{
            kode_emiten: string
            nama_emiten: string
            is_suspended: boolean
            d: number | null
            price: number | null
            priority: number
        }>>(query)

        const results = stocks.map(stock => ({
            symbol: stock.kode_emiten,
            name: stock.nama_emiten,
            change: stock.is_suspended ? 0 : (Number(stock.d) || 0),
            price: stock.is_suspended ? 0 : (Number(stock.price) || 0),
            is_suspended: stock.is_suspended,
        }))

        // 4. Cache the results in Redis
        await setCache(cacheKey, results, CACHE_TTL)

        return NextResponse.json(results)
    } catch (error) {
        console.error("Search API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

