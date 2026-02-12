import { NextResponse } from "next/server"
import { prisma } from "~/lib/prisma"

// Simple in-memory cache for search results
const searchCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 30000 // 30 seconds

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")

    if (!q || q.length < 2) {
        return NextResponse.json([])
    }

    const searchTerm = q.toUpperCase()

    // Check cache first
    const cacheKey = searchTerm
    const cached = searchCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json(cached.data)
    }

    try {
        const likeTerm = `%${searchTerm}%`
        const startsWithTerm = `${searchTerm}%`

        // Optimized query: Uses LATERAL JOIN instead of 2 correlated subqueries
        const stocks = await prisma.$queryRaw<Array<{
            kode_emiten: string
            nama_emiten: string
            d: number | null
            price: number | null
            priority: number
        }>>`
            SELECT 
                s.kode_emiten,
                s.nama_emiten,
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

        const results = stocks.map(stock => ({
            symbol: stock.kode_emiten,
            name: stock.nama_emiten,
            change: Number(stock.d) || 0,
            price: Number(stock.price) || 0
        }))

        // Cache the results
        searchCache.set(cacheKey, { data: results, timestamp: Date.now() })

        // Clean old cache entries periodically
        if (searchCache.size > 100) {
            const now = Date.now()
            for (const [key, value] of searchCache.entries()) {
                if (now - value.timestamp > CACHE_TTL) {
                    searchCache.delete(key)
                }
            }
        }

        return NextResponse.json(results)
    } catch (error) {
        console.error("Search API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
