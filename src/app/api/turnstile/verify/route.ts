import { NextResponse } from "next/server";
import { redisClient } from "~/lib/redis";
import { getClientIp } from "~/lib/rate-limiter";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { success: false, error: "Missing Turnstile verification token." },
                { status: 400 }
            );
        }

        const ip = getClientIp(request);
        const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

        if (!secretKey) {
            console.error("[Turnstile Verify] CLOUDFLARE_TURNSTILE_SECRET_KEY is not defined in env variables.");
            return NextResponse.json(
                { success: false, error: "Server environment error. Turnstile is misconfigured." },
                { status: 500 }
            );
        }

        // Call Cloudflare Turnstile Verification API
        console.log(`[Turnstile Verify] Verifying token for IP ${ip}...`);
        const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                secret: secretKey,
                response: token,
                remoteip: ip,
            }),
        });

        if (!verifyRes.ok) {
            throw new Error(`Cloudflare API responded with status ${verifyRes.status}`);
        }

        const data = await verifyRes.json();
        console.log("[Turnstile Verify] Cloudflare verification response:", data);

        if (data.success) {
            // 1. Set bypass key in Redis for 2 hours (7200 seconds)
            const bypassKey = `turnstile_passed:${ip}`;
            await redisClient.set(bypassKey, "true", "EX", 7200);

            // 2. Instantly unblock user by clearing their rate limit counters
            await redisClient.del(`rl:general:${ip}`);
            await redisClient.del(`rl:search:${ip}`);
            await redisClient.del(`rl:sse:active:${ip}`);

            console.log(`[Turnstile Verify] IP ${ip} successfully verified. Rate limits reset and bypass granted for 2 hours.`);
            return NextResponse.json({ success: true });
        } else {
            console.warn(`[Turnstile Verify] Failed validation for IP ${ip}:`, data["error-codes"]);
            return NextResponse.json(
                { success: false, error: "Turnstile verification failed. Please try again." },
                { status: 400 }
            );
        }
    } catch (err: any) {
        console.error("[Turnstile Verify] Unexpected error during verification:", err);
        return NextResponse.json(
            { success: false, error: "Internal server error during verification." },
            { status: 500 }
        );
    }
}
