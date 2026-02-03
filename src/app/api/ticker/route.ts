import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma";

export interface TickerData {
    symbol: string;
    name: string;
    price: number;
    h: number;  // 1 Hour change %
    d: number;  // 1 Day change %
    w: number;  // 1 Week change %
    m: number;  // 1 Month change %
    y: number;  // 1 Year change %
}

export async function GET() {
    try {
        // Get the latest ticker for each stock using a subquery
        // This fetches the most recent ticker record per stock_id
        const latestTickers = await prisma.$queryRaw<Array<{
            kode_emiten: string;
            nama_emiten: string;
            price: number;
            h: number | null;
            d: number | null;
            w: number | null;
            m: number | null;
            y: number | null;
        }>>`
            SELECT 
                s.kode_emiten,
                s.nama_emiten,
                t.price,
                t.h,
                t.d,
                t.w,
                t.m,
                t.y
            FROM stocks s
            INNER JOIN ticker t ON s.id = t.stocks_id
            WHERE t.ts = (
                SELECT MAX(t2.ts) 
                FROM ticker t2 
                WHERE t2.stocks_id = s.id
            )
            ORDER BY s.kode_emiten
        `;

        // Transform to frontend format
        const data: TickerData[] = latestTickers.map(row => ({
            symbol: row.kode_emiten,
            name: row.nama_emiten,
            price: row.price,
            h: row.h ?? 0,
            d: row.d ?? 0,
            w: row.w ?? 0,
            m: row.m ?? 0,
            y: row.y ?? 0,
        }));

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching ticker data:", error);
        return NextResponse.json(
            { error: "Failed to fetch ticker data" },
            { status: 500 }
        );
    }
}
