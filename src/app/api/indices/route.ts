import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma";

export interface IndexData {
    id: number;
    kode: string;
    nama: string;
}

export async function GET() {
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

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching indices:", error);
        return NextResponse.json(
            { error: "Failed to fetch indices" },
            { status: 500 }
        );
    }
}
