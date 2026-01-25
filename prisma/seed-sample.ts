import { PrismaClient } from "@prisma/client";
import sampleHistory from "./data/sample_ticker.json"; // Generated sample data

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting Sample Data Seed (Tickers)...");

    // Seed Sample History (For Collaborators)
    const tickerCount = await prisma.ticker.count();
    if (tickerCount === 0 && sampleHistory.length > 0) {
        console.log(`📜 Seeding ${sampleHistory.length} sample historical records...`);

        // Need to map Symbol -> ID again because IDs might differ
        const allStocks = await prisma.stock.findMany();
        const stockMap = new Map(allStocks.map(s => [s.kode_emiten, s.id]));

        const historyData = [];
        for (const rec of sampleHistory) {
            const stockId = stockMap.get(rec.symbol);
            if (stockId) {
                historyData.push({
                    stocks_id: stockId,
                    price: rec.price,
                    ts: new Date(rec.time * 1000), // Convert Unix to Date
                    h: 0, d: 0, w: 0, m: 0, y: 0
                });
            }
        }

        if (historyData.length > 0) {
            await prisma.ticker.createMany({
                data: historyData,
                skipDuplicates: true
            });
            console.log("✅ Sample history seeded!");
        }
    } else {
        console.log(`ℹ️ Ticker table has ${tickerCount} records. Skipping sample seeding.`);
    }

    console.log("🎉 Sample Seeding Complete!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
