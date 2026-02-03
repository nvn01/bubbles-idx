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

async function getLatestTickers(): Promise<TickerRow[]> {
    return await prisma.$queryRaw<TickerRow[]>`
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
}

export async function GET() {
    const encoder = new TextEncoder();

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
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(formatted)}\n\n`));
            } catch (error) {
                console.error("SSE initial data error:", error);
            }

            // Poll for updates every 60 seconds (matching scraper frequency)
            const interval = setInterval(async () => {
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
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(formatted)}\n\n`));
                } catch (error) {
                    console.error("SSE poll error:", error);
                }
            }, 60000); // 60 seconds

            // Cleanup on close
            // Note: This won't fire in all cases, but is a best-effort cleanup
            return () => {
                clearInterval(interval);
            };
        },
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
