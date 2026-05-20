import { getLatestTickerData, type TickerData } from "~/lib/ticker";
import { getRedisSub } from "~/lib/redis";
import { rateLimit, decrementActiveSSE, keepAliveActiveSSE, getClientIp } from "~/lib/rate-limiter";

export const dynamic = "force-dynamic";

interface SSEClient {
    id: string;
    controller: ReadableStreamDefaultController;
    encoder: TextEncoder;
    ip: string;
}

// Global list of active clients in this Node process
const activeClients = new Set<SSEClient>();
let isSubscribed = false;

// Shared latest data cache so new connections get the most up-to-date ticker data immediately
let globalCachedTickers: TickerData[] | null = null;

// Initialize the single process-level Redis subscription
function initRedisSubscription() {
    if (isSubscribed) return;
    isSubscribed = true;

    try {
        const sub = getRedisSub();
        console.log("[SSE] Subscribing to Redis channel 'ticker_updates'");
        
        sub.subscribe("ticker_updates", (err) => {
            if (err) {
                console.error("[SSE] Failed to subscribe to ticker_updates:", err);
                isSubscribed = false;
            }
        });

        sub.on("message", async (channel, message) => {
            if (channel !== "ticker_updates") return;
            
            console.log(`[SSE] Received update event from Redis channel. Broadcasting to ${activeClients.size} clients.`);
            
            try {
                // Fetch fresh data once from database
                const data = await getLatestTickerData();
                globalCachedTickers = data;
                
                // Broadcast to all active clients in this process
                const payload = `data: ${JSON.stringify(data)}\n\n`;
                const encoder = new TextEncoder();
                
                for (const client of activeClients) {
                    try {
                        client.controller.enqueue(encoder.encode(payload));
                    } catch (err) {
                        // Managed stream close
                    }
                }
            } catch (error) {
                console.error("[SSE] Error during Redis Pub/Sub broadcast:", error);
            }
        });
    } catch (err) {
        console.error("[SSE] Error initializing Redis subscription:", err);
        isSubscribed = false;
    }
}

export async function GET(request: Request) {
    // 1. Enforce concurrent SSE connections rate limit per IP
    const rateLimitResponse = await rateLimit(request, "sse");
    if (rateLimitResponse) return rateLimitResponse;

    const ip = getClientIp(request);
    const clientId = `${ip}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const encoder = new TextEncoder();

    // Ensure Redis Pub/Sub is initialized
    initRedisSubscription();

    let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

    const stream = new ReadableStream({
        async start(controller) {
            const client: SSEClient = {
                id: clientId,
                controller,
                encoder,
                ip,
            };

            // Register client
            activeClients.add(client);
            console.log(`[SSE] Client ${clientId} connected. Active clients in process: ${activeClients.size}`);

            // Send initial data immediately
            try {
                if (!globalCachedTickers) {
                    globalCachedTickers = await getLatestTickerData();
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(globalCachedTickers)}\n\n`));
            } catch (error) {
                console.error(`[SSE] Initial data push failed for client ${clientId}:`, error);
            }

            // Set up a 30-second heartbeat to keep connection alive and extend the lease
            heartbeatInterval = setInterval(async () => {
                try {
                    // Send keep-alive comment
                    controller.enqueue(encoder.encode(": ping\n\n"));
                    
                    // Extend the concurrent connection limit lease in Redis
                    await keepAliveActiveSSE(ip);
                } catch (error) {
                    // Fail gracefully when client is gone
                    if (heartbeatInterval) {
                        clearInterval(heartbeatInterval);
                        heartbeatInterval = null;
                    }
                }
            }, 30000); // 30 seconds
        },
        cancel() {
            // Called when client disconnects
            if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
                heartbeatInterval = null;
            }

            // Remove client from active list
            for (const client of activeClients) {
                if (client.id === clientId) {
                    activeClients.delete(client);
                    break;
                }
            }

            console.log(`[SSE] Client ${clientId} disconnected. Remaining active clients: ${activeClients.size}`);

            // Release connection slot in Redis concurrency limiter
            decrementActiveSSE(ip);
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
