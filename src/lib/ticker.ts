import { prisma } from "~/lib/prisma";

export interface TickerData {
    symbol: string;
    name: string;
    price: number;
    h: number;
    d: number;
    w: number;
    m: number;
    y: number;
}

interface LatestTickerRow {
    kode_emiten: string;
    nama_emiten: string;
    price: number;
    h: number | null;
    d: number | null;
    w: number | null;
    m: number | null;
    y: number | null;
}

export async function getLatestTickerData(): Promise<TickerData[]> {
    const latestTickers = await prisma.$queryRaw<LatestTickerRow[]>`
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
        JOIN LATERAL (
            SELECT
                ticker.price,
                ticker.h,
                ticker.d,
                ticker.w,
                ticker.m,
                ticker.y
            FROM ticker
            WHERE ticker.stocks_id = s.id
            ORDER BY ticker.ts DESC
            LIMIT 1
        ) t ON true
        WHERE s.is_suspended = false
    `;

    return latestTickers.map((row) => ({
        symbol: row.kode_emiten,
        name: row.nama_emiten,
        price: row.price,
        h: row.h ?? 0,
        d: row.d ?? 0,
        w: row.w ?? 0,
        m: row.m ?? 0,
        y: row.y ?? 0,
    }));
}
