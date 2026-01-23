import { PrismaClient } from "@prisma/client";
import stockList from "./data/Daftar_Saham_20260121.json";
import indexList from "./data/Daftar_Indeks.json";
import specialNotations from "./data/Notasi_Khusus_20260121.json";
import suspendedList from "./data/suspended_list.json";

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

    // 5. Seed Stocks (Expanded)
    // 5. Seed Stocks (Expanded)
    // const limit = 600; // Removed limit
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

    console.log("🎉 Seeding Complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
