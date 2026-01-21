import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic'; // Ensure live data functionality

export async function GET() {
    try {
        const stocks = await prisma.stock.findMany({
            include: {
                tickers: {
                    orderBy: { ts: 'desc' },
                    take: 1
                }
            }
        });

        const formatted = stocks.map(stock => {
            const latest = stock.tickers[0];
            if (!latest) return null;

            // Use stored daily change (d) or 0
            const change = latest.d ?? 0;

            return {
                id: stock.id,
                symbol: stock.kode_emiten,
                name: stock.nama_emiten,
                price: latest.price,
                change: change,
                volume: 0, // Volume removed from schema
                marketCap: 1, // Placeholder
                lastUpdated: latest.ts
            };
        }).filter(s => s !== null);

        return NextResponse.json(formatted);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
