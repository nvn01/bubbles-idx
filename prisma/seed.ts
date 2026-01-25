import { PrismaClient } from "@prisma/client";
import stockList from "./data/Daftar_Saham_20260121.json";
import indexList from "./data/Daftar_Indeks.json";
import specialNotations from "./data/Notasi_Khusus_20260121.json";
import suspendedList from "./data/suspended_list.json";
import sampleHistory from "./data/sample_ticker.json"; // Generated sample data
import indexMappings from "./data/indicies-list-stocks.json";

const prisma = new PrismaClient();

// Notation Definitions (Source: User Prompt)
const NOTATION_DEFS = [
    { kode: "B", deskripsi: "Permohonan Pailit/Pembatalan Perdamaian" },
    { kode: "M", deskripsi: "Permohonan PKPU" },
    { kode: "E", deskripsi: "Ekuitas Negatif" },
    { kode: "A", deskripsi: "Opini Tidak Wajar (Adverse)" },
    { kode: "D", deskripsi: "Opini Tidak Menyatakan Pendapat (Disclaimer)" },
    { kode: "L", deskripsi: "Belum Menyampaikan Laporan Keuangan" },
    { kode: "S", deskripsi: "Tidak Ada Pendapatan Usaha" },
    { kode: "C", deskripsi: "Kejadian Perkara Hukum Material" },
    { kode: "Q", deskripsi: "Pembatasan Kegiatan Usaha" },
    { kode: "Y", deskripsi: "Belum RUPST" },
    { kode: "F", deskripsi: "Sanksi Ringan OJK" },
    { kode: "G", deskripsi: "Sanksi Sedang OJK" },
    { kode: "V", deskripsi: "Sanksi Berat OJK" },
    { kode: "N", deskripsi: "Saham Hak Suara Multipel (Papan Utama/Pengembangan)" },
    { kode: "K", deskripsi: "Saham Hak Suara Multipel (Papan Ekonomi Baru)" },
    { kode: "I", deskripsi: "Tidak Menerapkan Saham Hak Suara Multipel (Papan Ekonomi Baru)" },
    { kode: "X", deskripsi: "Papan Pemantauan Khusus" }
];

async function main() {
    console.log("🌱 Starting Database Seed...");

    // 1. Seed Notations
    console.log("📝 Seeding Notations...");
    try {
        for (const def of NOTATION_DEFS) {
            await prisma.notation.upsert({
                where: { kode: def.kode },
                update: { deskripsi: def.deskripsi },
                create: def,
            });
        }
    } catch (e) {
        console.warn("⚠️  Error seeding notations (schema mismatch?):", e);
    }

    // 2. Seed Indices
    console.log(`📊 Seeding ${indexList.length} Indices...`);
    try {
        for (const idx of indexList) {
            await prisma.stockIndex.upsert({
                where: { kode: idx.kode },
                update: {
                    nama: idx.nama,
                    deskripsi: idx.deskripsi
                },
                create: {
                    id: idx.id,
                    kode: idx.kode,
                    nama: idx.nama,
                    deskripsi: idx.deskripsi
                }
            });
        }
    } catch (e) {
        console.warn("⚠️  Error seeding indices:", e);
    }

    // 3. Prepare Special Notations Map
    const notationMap = new Map<string, string[]>();
    for (const note of specialNotations) {
        const rawCode = note["Kode"];
        if (typeof rawCode === 'string') {
            const parts = rawCode.split(".");
            const baseSymbol = parts[0];

            // Check if Notasi exists and is a string
            const notasiStr = note["Notasi"];
            if (notasiStr && typeof notasiStr === 'string') {
                const notations = notasiStr.split(",").map(s => s.trim()).filter(s => s.length > 0);
                if (notations.length > 0 && baseSymbol) {
                    notationMap.set(baseSymbol, notations);
                }
            }
        }
    }

    // 4. Prepare Suspended Set
    const suspendedSet = new Set<string>();
    // suspendedList: check structure. User provided file content has "symbol" and "company".
    // Typescript might infer suspendedList as any[] or specific shape.
    // Cast strict check on item.
    if (Array.isArray(suspendedList)) {
        for (const item of suspendedList) {
            if (item && typeof item === 'object' && 'symbol' in item) {
                // @ts-ignore - JSON import type inference
                const sym = item.symbol;
                if (typeof sym === 'string') {
                    suspendedSet.add(sym);
                }
            }
        }
    }
    console.log(`🚫 Found ${suspendedSet.size} suspended stocks.`);


    const targets = stockList;
    console.log(`📦 Seeding ALL ${targets.length} Stocks...`);

    for (const item of targets) {
        const code = item["Kode"];
        const name = item["Nama Perusahaan"];
        const listingDate = item["Tanggal Pencatatan"];

        if (!code || !name) continue;

        // Determine Relations
        const activeNotations = notationMap.get(code) || [];
        const isSuspended = suspendedSet.has(code);

        // Prepare connect operations
        const validNotations = activeNotations.filter(n => NOTATION_DEFS.some(d => d.kode === n));
        const notationConnect = validNotations.map(n => ({ kode: n }));

        await prisma.stock.upsert({
            where: { kode_emiten: code },
            update: {
                nama_emiten: name,
                tanggal_pencatatan: listingDate,
                is_suspended: isSuspended,
                notations: {
                    set: notationConnect
                }
            },
            create: {
                kode_emiten: code,
                nama_emiten: name,
                tanggal_pencatatan: listingDate,
                is_suspended: isSuspended,
                notations: {
                    connect: notationConnect
                }
            },
        });
    }



    // 5. Connect Stocks to Indices
    console.log("🔗 Connecting Stocks to Indices...");

    // Alias Map (JSON Name -> DB Name) - Sync with compare_indices.py logic
    const indexAliases: Record<string, string> = {
        "Investor33": "INVESTOR33",
        "SMinfra18": "SMINFRA18",
        "IDXQ30": "IDXQUALITY30",
        "IDXV30": "IDXVALUE30",
        "IDXG30": "IDXGROWTH30",
        "Kompas100": "KOMPAS100" // Just in case
    };

    for (const mapping of indexMappings) {
        let dbIndexName = mapping.index_name;

        // Apply mapping if exists
        if (indexAliases[dbIndexName]) {
            dbIndexName = indexAliases[dbIndexName]!;
        } else if (dbIndexName.toUpperCase() !== dbIndexName) {
            // Try uppercase fallback if standard one fails (though our DB keys are mostly uppercase)
            // Check if raw uppercase exists in indexList
            const upper = dbIndexName.toUpperCase();
            if (indexList.some(i => i.kode === upper)) {
                dbIndexName = upper;
            }
        }

        // Find the index ID or Code
        const indexDef = indexList.find(i => i.kode === dbIndexName);
        if (!indexDef) {
            console.warn(`⚠️  Skipping unknown index: ${mapping.index_name} (Mapped to: ${dbIndexName})`);
            continue;
        }

        const stocksInIndex = mapping.stocks;
        if (stocksInIndex.length > 0) {
            // We can do a single update for the Index to connect all stocks
            // Finding stocks that exist in DB first? Prisma connect works on Unique inputs.
            // Assuming Stock.kode_emiten is unique.

            // Filter stocks that we actually have in our seed list
            // (Though creating relations to non-existent stocks will throw)
            // It's safer to connect from the Stock side or Index side?
            // Index side: update Index, connect Stocks [ {kode_emiten: 'A'}, {kode_emiten: 'B'} ]

            // NEW LOGIC: Pre-filter stocks that actually exist in our DB
            // Fetch all valid stock codes if not fetched yet (optimization: fetch once outside loop)
            const existingStocks = await prisma.stock.findMany({ select: { kode_emiten: true } });
            const validStockSet = new Set(existingStocks.map(s => s.kode_emiten));

            // Only connect stocks that are in our validStockSet
            const validStocksInIndex = stocksInIndex.filter(s => validStockSet.has(s));
            const skippedCount = stocksInIndex.length - validStocksInIndex.length;

            if (skippedCount > 0) {
                console.warn(`       ⚠️  Skipping ${skippedCount} stocks in ${dbIndexName} (Not found in DB).`);
            }

            const connectList = validStocksInIndex.map(s => ({ kode_emiten: s }));

            if (connectList.length > 0) {
                try {
                    await prisma.stockIndex.update({
                        where: { kode: dbIndexName },
                        data: {
                            stocks: {
                                connect: connectList
                            }
                        }
                    });
                    console.log(`   ✅ Connected ${connectList.length} stocks to ${dbIndexName}`);
                } catch (e) {
                    console.error(`   ❌ Failed to connect stocks for ${dbIndexName}:`, e);
                }
            } else {
                console.log(`   ℹ️  No valid stocks found for ${dbIndexName} (All skipped).`);
            }

        }
    }

    // 6. Seed Sample History (For Collaborators)
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

    console.log("🎉 Seeding Complete!");
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
