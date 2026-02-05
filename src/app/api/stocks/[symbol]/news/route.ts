import { NextResponse } from "next/server"
import { prisma } from "~/lib/prisma"

export async function GET(
    request: Request,
    props: { params: Promise<{ symbol: string }> }
) {
    const params = await props.params
    const symbol = params.symbol.toUpperCase()

    try {
        const news = await prisma.marketNews.findMany({
            where: {
                stock_symbols: { has: symbol }
            },
            take: 10,
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
                image_url: true
            }
        })

        const formattedNews = news.map(item => ({
            id: item.id,
            title: item.title,
            excerpt: item.summary,
            source: item.source,
            time: item.published_at.toISOString(),
            url: item.url,
            imageUrl: item.image_url
        }))

        return NextResponse.json(formattedNews)
    } catch (error) {
        console.error("News API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
