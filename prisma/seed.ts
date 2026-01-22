import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


// Corrected Symbol -> Name mapping provided by user
import stockList from "../../scrapper/Daftar_Saham_20260121.json";


async function main() {
    // 1. Take top 600 stocks
    const limit = 600;
    const targets = stockList.slice(0, limit);

    console.log(`🌱 Seeding top ${targets.length} (of ${stockList.length}) stocks from JSON...`);

    // 2. Upsert loop
    for (const item of targets) {
        // JSON keys: "Kode", "Nama Perusahaan"
        const code = item["Kode"]; // e.g. "AALI"
        const name = item["Nama Perusahaan"];

        if (!code || !name) continue;

        await prisma.stock.upsert({
            where: { kode_emiten: code },
            update: { nama_emiten: name },
            create: {
                kode_emiten: code,
                nama_emiten: name,
            },
        });
    }

    console.log(`🎉 Seeded ${targets.length} stocks!`);
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
