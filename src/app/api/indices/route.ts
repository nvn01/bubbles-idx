import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma";

export interface IndexData {
    id: number;
    kode: string;
    nama: string;
}

// Cache indices — they almost never change
let indicesCache: { data: IndexData[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
    // Return cached data if fresh
    if (indicesCache && Date.now() - indicesCache.timestamp < CACHE_TTL) {
        return NextResponse.json(indicesCache.data, {
            headers: {
                "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
            }
        });
    }

    try {
        // Fetch all indices from database, excluding IHSG
        const indices = await prisma.stockIndex.findMany({
            where: {
                kode: {
                    not: "IHSG"
                }
            },
            orderBy: {
                kode: "asc"
            },
            select: {
                id: true,
                kode: true,
                nama: true,
            }
        });

        // Transform to frontend format
        const data: IndexData[] = indices.map(idx => ({
            id: idx.id,
            kode: idx.kode,
            nama: idx.nama,
        }));

        // Cache result
        indicesCache = { data, timestamp: Date.now() };

        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
            }
        });
    } catch (error) {
        console.error("Error fetching indices:", error);
        return NextResponse.json(
            { error: "Failed to fetch indices" },
            { status: 500 }
        );
    }
}
