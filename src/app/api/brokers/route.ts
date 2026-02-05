import { NextResponse } from "next/server"
import { prisma } from "~/lib/prisma"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const sortBy = searchParams.get("sortBy") || "value" // value, volume, frequency
    const limit = parseInt(searchParams.get("limit") || "20")

    try {
        // Default to today if no dates provided
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const start = startDate ? new Date(startDate) : today
        const end = endDate ? new Date(endDate) : today

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

            return NextResponse.json({
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0],
                sortBy,
                brokers: result
            })
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

            return NextResponse.json({
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0],
                sortBy,
                brokers: result
            })
        }
    } catch (error) {
        console.error("Brokers API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
