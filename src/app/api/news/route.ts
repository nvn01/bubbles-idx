import { NextResponse } from "next/server"
import { prisma } from "~/lib/prisma"
import { getCache, setCache } from "~/lib/redis"
import { rateLimit } from "~/lib/rate-limiter"

const CACHE_TTL = 60 // 60 seconds (1 minute in Redis)

type NewsRecord = {
    id: number
    title: string
    summary: string | null
    url: string
    source: string
    published_at: Date
    image_url: string | null
    stock_symbols: string[]
}

const newsSelect = {
    id: true,
    title: true,
    summary: true,
    url: true,
    source: true,
    published_at: true,
    image_url: true,
    stock_symbols: true,
} as const

function formatNews(news: NewsRecord[]) {
    return news.map(item => ({
        id: item.id,
        title: item.title,
        excerpt: item.summary,
        source: item.source,
        time: item.published_at.toISOString(),
        url: item.url,
        imageUrl: item.image_url,
        symbols: item.stock_symbols || []
    }))
}

export async function GET(request: Request) {
    // 1. Apply General Rate Limiter (100 req/min/IP)
    const rateLimitResponse = await rateLimit(request, "general");
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()
    const rawLimit = Number(searchParams.get("limit") || "50")
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 50) : 50

    if (q) {
        if (q.length < 2) {
            return NextResponse.json([])
        }

        const searchTerm = q.toUpperCase()
        const cacheKey = `news:search:${searchTerm}-${limit}`
        
        try {
            // 2. Check Redis cache
            const cached = await getCache<any[]>(cacheKey)
            if (cached) {
                return NextResponse.json(cached, {
                    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" }
                })
            }

            const news = await prisma.marketNews.findMany({
                where: {
                    OR: [
                        { title: { contains: q, mode: "insensitive" } },
                        { summary: { contains: q, mode: "insensitive" } },
                        { source: { contains: q, mode: "insensitive" } },
                        { stock_symbols: { has: searchTerm } },
                    ]
                },
                take: limit,
                orderBy: {
                    published_at: "desc"
                },
                select: newsSelect
            })

            const formattedNews = formatNews(news)
            
            // Cache result in Redis
            await setCache(cacheKey, formattedNews, CACHE_TTL)

            return NextResponse.json(formattedNews, {
                headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" }
            })
        } catch (error) {
            console.error("Market News Search API Error:", error)
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
        }
    }

    const latestCacheKey = "news:latest"

    try {
        // 3. Check Redis cache for latest news
        const cached = await getCache<any[]>(latestCacheKey)
        if (cached) {
            return NextResponse.json(cached, {
                headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" }
            })
        }

        const news = await prisma.marketNews.findMany({
            take: 50,
            orderBy: {
                published_at: "desc"
            },
            select: newsSelect
        })

        const formattedNews = formatNews(news)

        // Cache result in Redis
        await setCache(latestCacheKey, formattedNews, CACHE_TTL)

        return NextResponse.json(formattedNews, {
            headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" }
        })
    } catch (error) {
        console.error("Market News API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
