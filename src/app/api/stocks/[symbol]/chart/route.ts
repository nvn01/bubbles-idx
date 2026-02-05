import { NextResponse } from "next/server"
import { prisma } from "~/lib/prisma"

export async function GET(
    request: Request,
    props: { params: Promise<{ symbol: string }> }
) {
    const params = await props.params
    const symbol = params.symbol.toUpperCase()
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "1D"

    try {
        const now = new Date()
        let startDate = new Date()

        switch (range) {
            case "1D": // Last 24 hours of trading
                startDate.setDate(now.getDate() - 1)
                break
            case "1W":
                startDate.setDate(now.getDate() - 7)
                break
            case "1M":
                startDate.setMonth(now.getMonth() - 1)
                break
            case "3M":
                startDate.setMonth(now.getMonth() - 3)
                break
            case "1Y":
                startDate.setFullYear(now.getFullYear() - 1)
                break
            case "5Y":
                startDate.setFullYear(now.getFullYear() - 5)
                break
            default: // Default to 1D
                startDate.setDate(now.getDate() - 1)
        }

        // Fetch ticker history
        const tickers = await prisma.ticker.findMany({
            where: {
                stock: { kode_emiten: symbol },
                ts: { gte: startDate }
            },
            orderBy: { ts: "asc" },
            select: {
                ts: true,
                price: true
            }
        })

        const data = tickers.map(t => ({
            time: t.ts.toISOString(),
            value: t.price
        }))

        return NextResponse.json(data)
    } catch (error) {
        console.error("Chart API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
