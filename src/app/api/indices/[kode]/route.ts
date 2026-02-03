import { NextResponse } from "next/server";
import { prisma } from "~/lib/prisma";

interface RouteParams {
    params: Promise<{ kode: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { kode } = await params;
        const indexKode = kode.toUpperCase();

        // Find the index by kode
        const stockIndex = await prisma.stockIndex.findFirst({
            where: {
                kode_index: indexKode
            },
            include: {
                members: {
                    include: {
                        stock: {
                            select: {
                                kode_emiten: true,
                                nama_emiten: true,
                            }
                        }
                    }
                }
            }
        });

        if (!stockIndex) {
            return NextResponse.json(
                { error: `Index ${indexKode} not found` },
                { status: 404 }
            );
        }

        // Extract stock symbols from the members
        const symbols = stockIndex.members
            .map(m => m.stock.kode_emiten)
            .filter(Boolean)
            .sort();

        return NextResponse.json({
            kode: stockIndex.kode_index,
            nama: stockIndex.nama_index,
            symbols: symbols,
        });
    } catch (error) {
        console.error("Error fetching index stocks:", error);
        return NextResponse.json(
            { error: "Failed to fetch index stocks" },
            { status: 500 }
        );
    }
}
