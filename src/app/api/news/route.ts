import { NextResponse } from "next/server"
import { prisma } from "~/lib/prisma"

// Cache for 5 minutes
let cache: { data: unknown; timestamp: number } | null = null
const CACHE_TTL = 5 * 60 * 1000

export async function GET() {
    // Return cached data if fresh
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
        return NextResponse.json(cache.data)
    }

    try {
        const news = await prisma.marketNews.findMany({
            take: 50,
            orderBy: {
                published_at: "desc"
            },
            select: {
                id: true,
                title: true,
                summary: true,
                url: true,
                source: true,
                published_at: true,
                image_url: true,
                stock_symbols: true
            }
        })

        const formattedNews = news.map(item => ({
            id: item.id,
            title: item.title,
            excerpt: item.summary,
            source: item.source,
            time: item.published_at.toISOString(),
            url: item.url,
            imageUrl: item.image_url,
            symbols: item.stock_symbols || []
        }))

        // Update cache
        cache = { data: formattedNews, timestamp: Date.now() }

        return NextResponse.json(formattedNews)
    } catch (error) {
        console.error("Market News API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
