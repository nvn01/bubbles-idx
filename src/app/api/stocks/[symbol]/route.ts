import { NextResponse } from "next/server"
import { prisma } from "~/lib/prisma"

// In-memory cache for stock details
const stockCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 15000 // 15 seconds - shorter for real-time data

export async function GET(
    request: Request,
    props: { params: Promise<{ symbol: string }> }
) {
    const params = await props.params
    const symbol = params.symbol.toUpperCase()

    // Check cache
    const cached = stockCache.get(symbol)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json(cached.data)
    }

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
        const isSuspended = stock.is_suspended

        // Format data for frontend
        const data = {
            symbol: stock.kode_emiten,
            name: stock.nama_emiten,
            // Suspended stocks have no active trading — zero out price/change
            price: isSuspended ? 0 : (latestTicker?.price || 0),
            change: isSuspended ? 0 : (latestTicker?.d || 0), // Daily change as primary
            is_suspended: isSuspended,
            listingDate: stock.tanggal_pencatatan,
            indices: stock.indices.map(i => i.nama),
            // Performance metrics — all zero for suspended stocks
            changes: {
                h: isSuspended ? 0 : (latestTicker?.h || 0),
                d: isSuspended ? 0 : (latestTicker?.d || 0),
                w: isSuspended ? 0 : (latestTicker?.w || 0),
                m: isSuspended ? 0 : (latestTicker?.m || 0),
                y: isSuspended ? 0 : (latestTicker?.y || 0),
            }
        }

        // Cache result
        stockCache.set(symbol, { data, timestamp: Date.now() })

        // Cleanup old entries
        if (stockCache.size > 200) {
            const now = Date.now()
            for (const [key, value] of stockCache.entries()) {
                if (now - value.timestamp > CACHE_TTL) {
                    stockCache.delete(key)
                }
            }
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error("Stock Details API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
