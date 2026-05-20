import { NextResponse } from "next/server"
import { prisma } from "~/lib/prisma"
import { getCache, setCache } from "~/lib/redis"
import { rateLimit } from "~/lib/rate-limiter"

const CACHE_TTL = 5 * 60; // 5 minutes in seconds

export async function GET(request: Request) {
    // 1. Apply General Rate Limiter (100 req/min/IP)
    const rateLimitResponse = await rateLimit(request, "general");
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const upcoming = searchParams.get("upcoming") === "true"

    const cacheKey = `calendar:${limit}:${upcoming}`

    try {
        // 2. Check Redis cache first
        const cached = await getCache<any[]>(cacheKey);
        if (cached) {
            return NextResponse.json(cached, {
                headers: {
                    "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
                }
            });
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const events = await prisma.corporateCalendar.findMany({
            where: upcoming ? {
                date: {
                    gte: today
                }
            } : undefined,
            orderBy: {
                date: upcoming ? "asc" : "desc"
            },
            take: limit
        })

        // Group events by date for easier UI rendering
        const groupedEvents = events.reduce((acc, event) => {
            const dateKey = event.date?.toISOString().split('T')[0] || 'unknown'
            if (!acc[dateKey]) {
                acc[dateKey] = []
            }
            acc[dateKey].push({
                id: event.id,
                kode_emiten: event.kode_emiten,
                description: event.description,
                location: event.location
            })
            return acc
        }, {} as Record<string, Array<{
            id: number
            kode_emiten: string
            description: string
            location: string | null
        }>>)

        // Convert to array format for frontend
        const result = Object.entries(groupedEvents).map(([date, events]) => ({
            date,
            events
        }))

        // 3. Cache results in Redis
        await setCache(cacheKey, result, CACHE_TTL);

        return NextResponse.json(result, {
            headers: {
                "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
            }
        })
    } catch (error) {
        console.error("Calendar API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
