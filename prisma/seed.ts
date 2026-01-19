// Seed file to populate IDX30 stocks
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// IDX30 symbols with full company names
const IDX30_STOCKS = [
    { symbol: "AADI", name: "Adaro Andalan Indonesia Tbk." },
    { symbol: "ADRO", name: "Alamtri Resources Indonesia Tbk." },
    { symbol: "AMRT", name: "Sumber Alfaria Trijaya Tbk." },
    { symbol: "ANTM", name: "Aneka Tambang Tbk." },
    { symbol: "ASII", name: "Astra International Tbk." },
    { symbol: "BBCA", name: "Bank Central Asia Tbk." },
    { symbol: "BBNI", name: "Bank Negara Indonesia Tbk." },
    { symbol: "BBRI", name: "Bank Rakyat Indonesia Tbk." },
    { symbol: "BMRI", name: "Bank Mandiri Tbk." },
    { symbol: "BRPT", name: "Barito Pacific Tbk." },
    { symbol: "CPIN", name: "Charoen Pokphand Indonesia Tbk." },
    { symbol: "GOTO", name: "GoTo Gojek Tokopedia Tbk." },
    { symbol: "ICBP", name: "Indofood CBP Sukses Makmur Tbk." },
    { symbol: "INCO", name: "Vale Indonesia Tbk." },
    { symbol: "INDF", name: "Indofood Sukses Makmur Tbk." },
    { symbol: "INKP", name: "Indah Kiat Pulp & Paper Tbk." },
    { symbol: "ISAT", name: "Indosat Tbk." },
    { symbol: "ITMG", name: "Indo Tambangraya Megah Tbk." },
    { symbol: "JPFA", name: "Japfa Comfeed Indonesia Tbk." },
    { symbol: "KLBF", name: "Kalbe Farma Tbk." },
    { symbol: "MBMA", name: "Merdeka Battery Materials Tbk." },
    { symbol: "MDKA", name: "Merdeka Copper Gold Tbk." },
    { symbol: "MEDC", name: "Medco Energi Internasional Tbk." },
    { symbol: "PGAS", name: "Perusahaan Gas Negara Tbk." },
    { symbol: "PGEO", name: "Pertamina Geothermal Energy Tbk." },
    { symbol: "PTBA", name: "Bukit Asam Tbk." },
    { symbol: "SMGR", name: "Semen Indonesia Tbk." },
    { symbol: "TLKM", name: "Telkom Indonesia Tbk." },
    { symbol: "UNTR", name: "United Tractors Tbk." },
    { symbol: "UNVR", name: "Unilever Indonesia Tbk." },
];

async function main() {
    console.log("🌱 Seeding IDX30 stocks...");

    for (const stock of IDX30_STOCKS) {
        await prisma.stock.upsert({
            where: { symbol: stock.symbol },
            update: { name: stock.name },
            create: {
                symbol: stock.symbol,
                name: stock.name,
            },
        });
        console.log(`  ✅ ${stock.symbol} - ${stock.name}`);
    }

    console.log(`\n🎉 Seeded ${IDX30_STOCKS.length} stocks!`);
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
