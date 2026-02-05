import { NextResponse } from "next/server"
import { prisma } from "~/lib/prisma"

export async function GET(
    request: Request,
    props: { params: Promise<{ symbol: string }> }
) {
    const params = await props.params
    const symbol = params.symbol.toUpperCase()

    try {
        const stock = await prisma.stock.findUnique({
            where: { kode_emiten: symbol },
            include: {
                indices: true,
                tickers: {
                    orderBy: { ts: "desc" },
                    take: 1
                }
            }
        })

        if (!stock) {
            return NextResponse.json({ error: "Stock not found" }, { status: 404 })
        }

        const latestTicker = stock.tickers[0]

        // Format data for frontend
        const data = {
            symbol: stock.kode_emiten,
            name: stock.nama_emiten,
            price: latestTicker?.price || 0,
            change: latestTicker?.d || 0, // Daily change as primary
            listingDate: stock.tanggal_pencatatan,
            indices: stock.indices.map(i => i.nama),
            // Performance metrics
            changes: {
                h: latestTicker?.h || 0,
                d: latestTicker?.d || 0,
                w: latestTicker?.w || 0,
                m: latestTicker?.m || 0,
                y: latestTicker?.y || 0,
            }
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error("Stock Details API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
