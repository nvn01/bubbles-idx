import { NextResponse } from "next/server"
import { prisma } from "~/lib/prisma"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")

    if (!q || q.length < 2) {
        return NextResponse.json([])
    }

    try {
        // Use raw SQL to prioritize symbol matches over name matches
        // Priority 1: Symbol starts with query (e.g., "BB" -> BBRI, BBCA)
        // Priority 2: Symbol contains query anywhere
        // Priority 3: Name contains query
        const searchTerm = q.toUpperCase()
        const likeTerm = `%${searchTerm}%`
        const startsWithTerm = `${searchTerm}%`

        const stocks = await prisma.$queryRaw<Array<{
            kode_emiten: string
            nama_emiten: string
            d: number | null
            price: number | null
        }>>`
            SELECT DISTINCT ON (s.kode_emiten)
                s.kode_emiten,
                s.nama_emiten,
                t.d,
                t.price
            FROM stocks s
            LEFT JOIN ticker t ON s.id = t.stocks_id
            WHERE 
                s.kode_emiten ILIKE ${likeTerm}
                OR s.nama_emiten ILIKE ${likeTerm}
            ORDER BY 
                s.kode_emiten,
                t.ts DESC NULLS LAST
        `

        // Sort results by priority in JavaScript for cleaner logic
        const sortedStocks = stocks.sort((a, b) => {
            const aSymbol = a.kode_emiten.toUpperCase()
            const bSymbol = b.kode_emiten.toUpperCase()
            const aName = a.nama_emiten.toUpperCase()
            const bName = b.nama_emiten.toUpperCase()

            // Priority 1: Symbol starts with search term
            const aStartsWith = aSymbol.startsWith(searchTerm)
            const bStartsWith = bSymbol.startsWith(searchTerm)

            if (aStartsWith && !bStartsWith) return -1
            if (!aStartsWith && bStartsWith) return 1

            // Priority 2: Symbol contains search term (both start or both don't)
            const aSymbolContains = aSymbol.includes(searchTerm)
            const bSymbolContains = bSymbol.includes(searchTerm)

            if (aSymbolContains && !bSymbolContains) return -1
            if (!aSymbolContains && bSymbolContains) return 1

            // Priority 3: Sort alphabetically by symbol
            return aSymbol.localeCompare(bSymbol)
        })

        const results = sortedStocks.map(stock => ({
            symbol: stock.kode_emiten,
            name: stock.nama_emiten,
            change: stock.d || 0,
            price: stock.price || 0
        }))

        return NextResponse.json(results)
    } catch (error) {
        console.error("Search API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
