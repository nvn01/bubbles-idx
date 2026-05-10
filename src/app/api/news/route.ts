import { NextResponse } from "next/server"
import { prisma } from "~/lib/prisma"

// Cache for 5 minutes
let cache: { data: unknown; timestamp: number } | null = null
const searchCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

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
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()
    const rawLimit = Number(searchParams.get("limit") || "50")
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 50) : 50

    if (q) {
        if (q.length < 2) {
            return NextResponse.json([])
        }

        const searchTerm = q.toUpperCase()
        const cacheKey = `${searchTerm}-${limit}`
        const cached = searchCache.get(cacheKey)

        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return NextResponse.json(cached.data, {
                headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" }
            })
        }

        try {
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
            searchCache.set(cacheKey, { data: formattedNews, timestamp: Date.now() })

            if (searchCache.size > 100) {
                const now = Date.now()
                for (const [key, value] of searchCache.entries()) {
                    if (now - value.timestamp > CACHE_TTL) {
                        searchCache.delete(key)
                    }
                }
            }

            return NextResponse.json(formattedNews, {
                headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" }
            })
        } catch (error) {
            console.error("Market News Search API Error:", error)
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
        }
    }

    // Return cached data if fresh
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
        return NextResponse.json(cache.data, {
            headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" }
        })
    }

    try {
        const news = await prisma.marketNews.findMany({
            take: 50,
            orderBy: {
                published_at: "desc"
            },
            select: newsSelect
        })

        const formattedNews = formatNews(news)

        // Update cache
        cache = { data: formattedNews, timestamp: Date.now() }

        return NextResponse.json(formattedNews, {
            headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" }
        })
    } catch (error) {
        console.error("Market News API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
