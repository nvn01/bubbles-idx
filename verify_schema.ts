import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Verifying Schema...");

    // 1. Check Indices
    const indexCount = await prisma.stockIndex.count();
    console.log(`✅ Indices Count: ${indexCount}`);

    // 2. Check Notations
    const notationCount = await prisma.notation.count();
    console.log(`✅ Notations Count: ${notationCount}`);

    // 3. Check ANY Stock with Notation
    const stocksWithNotation = await prisma.stock.findMany({
        where: { notations: { some: {} } },
        include: { notations: true },
        take: 3
    });

    if (stocksWithNotation.length > 0) {
        console.log(`✅ Found ${stocksWithNotation.length} stocks with notations:`);
        stocksWithNotation.forEach(s => {
            console.log(`   - ${s.kode_emiten}: ${JSON.stringify(s.notations)}`);
        });
    } else {
        console.log("⚠️ No stocks with notations found in the current seeded list.");
    }

    // Check Suspended column (should be false)
    const suspended = await prisma.stock.findFirst({ select: { is_suspended: true } });
    console.log(`✅ Sample is_suspended: ${suspended?.is_suspended}`);
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
