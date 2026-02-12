import { prisma } from "~/lib/prisma";

export const dynamic = "force-dynamic";

interface TickerRow {
    kode_emiten: string;
    nama_emiten: string;
    price: number;
    h: number | null;
    d: number | null;
    w: number | null;
    m: number | null;
    y: number | null;
}

// Shared cache for SSE stream — avoids hammering DB every poll
let cachedTickers: { data: TickerRow[]; timestamp: number } | null = null;
const CACHE_TTL = 60000; // 60 seconds (data only changes every ~10 minutes from scraper)

async function getLatestTickers(): Promise<TickerRow[]> {
    // Return cached data if fresh
    if (cachedTickers && Date.now() - cachedTickers.timestamp < CACHE_TTL) {
        return cachedTickers.data;
    }

    // Optimized: DISTINCT ON instead of correlated subquery
    const data = await prisma.$queryRaw<TickerRow[]>`
        SELECT DISTINCT ON (s.id)
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
        ORDER BY s.id, t.ts DESC
    `;

    cachedTickers = { data, timestamp: Date.now() };
    return data;
}

export async function GET() {
    const encoder = new TextEncoder();
    let isClosed = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const stream = new ReadableStream({
        async start(controller) {
            // Send initial data immediately
            try {
                const data = await getLatestTickers();
                const formatted = data.map(row => ({
                    symbol: row.kode_emiten,
                    name: row.nama_emiten,
                    price: row.price,
                    h: row.h ?? 0,
                    d: row.d ?? 0,
                    w: row.w ?? 0,
                    m: row.m ?? 0,
                    y: row.y ?? 0,
                }));
                if (!isClosed) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(formatted)}\n\n`));
                }
            } catch (error) {
                console.error("SSE initial data error:", error);
            }

            // Poll for updates every 60 seconds (matching scraper frequency)
            intervalId = setInterval(async () => {
                if (isClosed) {
                    if (intervalId) clearInterval(intervalId);
                    return;
                }
                try {
                    const data = await getLatestTickers();
                    const formatted = data.map(row => ({
                        symbol: row.kode_emiten,
                        name: row.nama_emiten,
                        price: row.price,
                        h: row.h ?? 0,
                        d: row.d ?? 0,
                        w: row.w ?? 0,
                        m: row.m ?? 0,
                        y: row.y ?? 0,
                    }));
                    if (!isClosed) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(formatted)}\n\n`));
                    }
                } catch (error) {
                    // Only log if not a "controller closed" error
                    if (!isClosed) {
                        console.error("SSE poll error:", error);
                    }
                }
            }, 60000); // 60 seconds
        },
        cancel() {
            // Called when the client disconnects
            isClosed = true;
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no", // Disable nginx buffering
        },
    });
}
