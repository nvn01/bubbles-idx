import { getLatestTickerData, type TickerData } from "~/lib/ticker";

export const dynamic = "force-dynamic";

// Shared cache for SSE stream — avoids hammering DB every poll
let cachedTickers: { data: TickerData[]; timestamp: number } | null = null;
const CACHE_TTL = 60000; // 60 seconds (data only changes every ~10 minutes from scraper)

async function getLatestTickers(): Promise<TickerData[]> {
    // Return cached data if fresh
    if (cachedTickers && Date.now() - cachedTickers.timestamp < CACHE_TTL) {
        return cachedTickers.data;
    }

    const data = await getLatestTickerData();
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
                if (!isClosed) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
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
                    if (!isClosed) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
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
