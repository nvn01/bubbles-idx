import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic'; // Ensure live data functionality

export async function GET() {
    try {
        const stocks = await prisma.stock.findMany({
            include: {
                history: {
                    orderBy: { ts: 'desc' },
                    take: 1
                }
            }
        });

        const formatted = stocks.map(stock => {
            const latest = stock.history[0];
            if (!latest) return null;

            // Calculate Change %
            const change = latest.open !== 0 ? ((latest.close - latest.open) / latest.open) * 100 : 0;

            return {
                id: stock.id,
                symbol: stock.symbol,
                name: stock.name,
                price: latest.close,
                change: change,
                volume: Number(latest.volume),
                marketCap: Number(latest.volume) * latest.close,
                lastUpdated: latest.ts
            };
        }).filter(s => s !== null);

        return NextResponse.json(formatted);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
