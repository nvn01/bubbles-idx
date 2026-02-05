import { NextResponse } from "next/server"
import { prisma } from "~/lib/prisma"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")

    if (!q || q.length < 2) {
        return NextResponse.json([])
    }

    try {
        const stocks = await prisma.stock.findMany({
            where: {
                OR: [
                    { kode_emiten: { contains: q, mode: "insensitive" } },
                    { nama_emiten: { contains: q, mode: "insensitive" } },
                ],
            },
            take: 10,
            select: {
                kode_emiten: true,
                nama_emiten: true,
                tickers: {
                    orderBy: { ts: "desc" },
                    take: 1,
                    select: {
                        d: true, // 1 day % change
                        price: true
                    }
                }
            }
        })

        const results = stocks.map(stock => ({
            symbol: stock.kode_emiten,
            name: stock.nama_emiten,
            change: stock.tickers[0]?.d || 0,
            price: stock.tickers[0]?.price || 0
        }))

        return NextResponse.json(results)
    } catch (error) {
        console.error("Search API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
