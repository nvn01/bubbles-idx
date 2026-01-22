import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Verifying Suspended Status...");

    // Check HITS
    const stock = await prisma.stock.findUnique({
        where: { kode_emiten: "HITS" },
        select: { kode_emiten: true, is_suspended: true, notations: true }
    });

    if (stock) {
        console.log(`✅ ${stock.kode_emiten} Suspended: ${stock.is_suspended}`);
        console.log(`   Notations: ${JSON.stringify(stock.notations)}`);
    } else {
        console.log("❌ HITS stock not found in DB.");
    }

    // Check non-suspended (e.g. BBCA)
    const bbca = await prisma.stock.findUnique({
        where: { kode_emiten: "BBCA" },
        select: { kode_emiten: true, is_suspended: true }
    });
    console.log(`✅ ${bbca?.kode_emiten} Suspended: ${bbca?.is_suspended}`);
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
