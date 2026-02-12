import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma";

interface RouteParams {
    params: Promise<{ kode: string }>;
}

// Cache per index kode — membership rarely changes
const indexCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { kode } = await params;
        const indexKode = kode.toUpperCase();

        // Check cache
        const cached = indexCache.get(indexKode);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return NextResponse.json(cached.data);
        }

        // Find the index by kode and include its stocks (many-to-many relation)
        const stockIndex = await prisma.stockIndex.findFirst({
            where: {
                kode: indexKode
            },
            include: {
                stocks: {
                    select: {
                        kode_emiten: true,
                        nama_emiten: true,
                    }
                }
            }
        });

        if (!stockIndex) {
            return NextResponse.json(
                { error: `Index ${indexKode} not found` },
                { status: 404 }
            );
        }

        // Extract stock symbols from the stocks relation
        const symbols = stockIndex.stocks
            .map(s => s.kode_emiten)
            .filter(Boolean)
            .sort();

        const data = {
            kode: stockIndex.kode,
            nama: stockIndex.nama,
            symbols: symbols,
        };

        // Cache result
        indexCache.set(indexKode, { data, timestamp: Date.now() });

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching index stocks:", error);
        return NextResponse.json(
            { error: "Failed to fetch index stocks" },
            { status: 500 }
        );
    }
}
