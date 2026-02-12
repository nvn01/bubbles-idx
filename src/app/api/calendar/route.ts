import { NextResponse } from "next/server"
import { prisma } from "~/lib/prisma"

// Cache for calendar events — 5 minutes
let calendarCache: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const upcoming = searchParams.get("upcoming") === "true"

    // Use cache for default requests (upcoming, limit 50)
    const isDefaultRequest = limit === 50;
    if (isDefaultRequest && calendarCache && Date.now() - calendarCache.timestamp < CACHE_TTL) {
        return NextResponse.json(calendarCache.data, {
            headers: {
                "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
            }
        });
    }

    try {
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

        // Cache default requests
        if (isDefaultRequest) {
            calendarCache = { data: result, timestamp: Date.now() };
        }

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
