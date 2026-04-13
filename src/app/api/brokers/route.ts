import { NextResponse } from "next/server"
import { prisma } from "~/lib/prisma"
import { z } from "zod"

// In-memory cache keyed by date+sort combo
const brokerCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds

const ALLOWED_SORT_FIELDS = ["value", "volume", "frequency"] as const;
const MAX_LIMIT = 100;

const brokerQuerySchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(ALLOWED_SORT_FIELDS).default("value"),
    limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(20),
});

function parseDateInput(value: string | undefined, fallback: Date): Date | null {
    if (!value) return fallback;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const parsedQuery = brokerQuerySchema.safeParse({
        startDate: searchParams.get("startDate") ?? undefined,
        endDate: searchParams.get("endDate") ?? undefined,
        sortBy: searchParams.get("sortBy") ?? undefined,
        limit: searchParams.get("limit") ?? undefined,
    })

    if (!parsedQuery.success) {
        return NextResponse.json(
            { error: "Invalid query parameters" },
            { status: 400 }
        )
    }

    const { startDate, endDate, sortBy, limit } = parsedQuery.data

    try {
        // Default to today if no dates provided
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const start = parseDateInput(startDate, today)
        const end = parseDateInput(endDate, today)

        if (!start || !end) {
            return NextResponse.json(
                { error: "Invalid date format" },
                { status: 400 }
            )
        }

        if (start > end) {
            return NextResponse.json(
                { error: "startDate must be before or equal to endDate" },
                { status: 400 }
            )
        }

        // Check cache
        const cacheKey = `${start.toISOString()}-${end.toISOString()}-${sortBy}-${limit}`;
        const cached = brokerCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return NextResponse.json(cached.data);
        }

        let responseData;

        // If date range, aggregate the data; otherwise just fetch single day
        if (start.getTime() === end.getTime()) {
            // Single day - just fetch and sort
            const brokers = await prisma.brokerSummary.findMany({
                where: {
                    date: start
                },
                orderBy: {
                    [sortBy]: "desc"
                },
                take: limit
            })

            const result = brokers.map((b, index) => ({
                rank: index + 1,
                kode: b.kode,
                nama: b.nama,
                value: Number(b.value),
                volume: Number(b.volume),
                frequency: b.frequency
            }))

            responseData = {
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0],
                sortBy,
                brokers: result
            };
        } else {
            // Date range - aggregate with raw SQL
            const sortColumn = sortBy === "value" ? "total_value"
                : sortBy === "volume" ? "total_volume"
                    : "total_frequency"

            const brokers = await prisma.$queryRawUnsafe<Array<{
                kode: string
                nama: string
                total_value: bigint
                total_volume: bigint
                total_frequency: bigint
            }>>(`
                SELECT 
                    kode,
                    MAX(nama) as nama,
                    SUM(value) as total_value,
                    SUM(volume) as total_volume,
                    SUM(frequency) as total_frequency
                FROM broker_summary
                WHERE date >= $1 AND date <= $2
                GROUP BY kode
                ORDER BY ${sortColumn} DESC
                LIMIT $3
            `, start, end, limit)

            const result = brokers.map((b, index) => ({
                rank: index + 1,
                kode: b.kode,
                nama: b.nama,
                value: Number(b.total_value),
                volume: Number(b.total_volume),
                frequency: Number(b.total_frequency)
            }))

            responseData = {
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0],
                sortBy,
                brokers: result
            };
        }

        // Cache result
        brokerCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

        // Cleanup old entries
        if (brokerCache.size > 50) {
            const now = Date.now();
            for (const [key, value] of brokerCache.entries()) {
                if (now - value.timestamp > CACHE_TTL) {
                    brokerCache.delete(key);
                }
            }
        }

        return NextResponse.json(responseData);
    } catch (error) {
        console.error("Brokers API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
