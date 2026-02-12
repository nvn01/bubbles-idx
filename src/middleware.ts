import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 120; // 120 requests per minute per IP

function getRateLimitKey(request: NextRequest): string {
    // Use X-Forwarded-For from Traefik/Cloudflare, fallback to generic
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const cfIp = request.headers.get("cf-connecting-ip");
    return cfIp || realIp || forwarded?.split(",")[0]?.trim() || "unknown";
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only rate-limit API routes
    if (pathname.startsWith("/api/")) {
        const ip = getRateLimitKey(request);
        const now = Date.now();
        const record = rateLimitMap.get(ip);

        if (!record || now > record.resetTime) {
            rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        } else {
            record.count++;
            if (record.count > RATE_LIMIT_MAX) {
                return NextResponse.json(
                    { error: "Too many requests. Please try again later." },
                    {
                        status: 429,
                        headers: {
                            "Retry-After": "60",
                            "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
                            "X-RateLimit-Remaining": "0",
                        },
                    }
                );
            }
        }

        // Cleanup old entries periodically
        if (rateLimitMap.size > 1000) {
            for (const [key, val] of rateLimitMap.entries()) {
                if (now > val.resetTime) rateLimitMap.delete(key);
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/api/:path*"],
};
