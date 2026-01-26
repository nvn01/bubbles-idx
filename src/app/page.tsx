"use client"

import { useState } from "react"
import { Header } from "~/components/Header"
import { BubbleCanvas } from "~/components/BubbleCanvas"
import { Sidebar } from "~/components/Sidebar"
import { ThemeProvider } from "~/contexts/ThemeContext"
import type { TimePeriod } from "~/lib/bubble-physics"

const IDX80_STOCKS = [
    "AADI", "ACES", "ADMR", "ADRO", "AKRA", "AMMN", "AMRT", "ANTM", "ARTO", "ASII",
    "AVIA", "BBCA", "BBNI", "BBRI", "BBTN", "BMRI", "BRMS", "BRPT", "BSDE", "BTPS",
    "BUKA", "BUMI", "CMRY", "CPIN", "CTRA", "DSNG", "DSSA", "ELSA", "EMTK", "ENRG",
    "ERAA", "ESSA", "EXCL", "GOTO", "HEAL", "HRUM", "ICBP", "INCO", "INDF", "INDY",
    "INKP", "INTP", "ISAT", "ITMG", "JPFA", "JSMR", "KIJA", "KLBF", "KPIG", "LSIP",
    "MAPA", "MAPI", "MBMA", "MDKA", "MEDC", "MIKA", "MTEL", "MYOR", "NCKL", "PANI",
    "PGAS", "PGEO", "PNBN", "PNLF", "PTBA", "PTRO", "PWON", "RAJA", "RATU", "SCMA",
    "SIDO", "SMGR", "SMRA", "SSIA", "TAPG", "TLKM", "TOWR", "UNTR", "UNVR", "WIFI",
]

// Sample watchlist stocks (for demo)
const SAMPLE_WATCHLIST_STOCKS: Record<number, string[]> = {
    1: ["BBCA", "BBRI", "BMRI", "BBNI"],
    2: ["GOTO", "BUKA", "EMTK", "ARTO"],
}

function IndexContent() {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("1D")
    const [selectedIndex, setSelectedIndex] = useState<string | null>(null)
    const [selectedWatchlist, setSelectedWatchlist] = useState<number | null>(null)

    // Determine which stocks to display based on filter selection
    const getSelectedSymbols = (): string[] => {
        if (selectedWatchlist && SAMPLE_WATCHLIST_STOCKS[selectedWatchlist]) {
            return SAMPLE_WATCHLIST_STOCKS[selectedWatchlist]
        }
        // For now, always return IDX80. Later we'll fetch index-specific stocks from DB
        return IDX80_STOCKS
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                selectedIndex={selectedIndex}
                onSelectIndex={setSelectedIndex}
                selectedWatchlist={selectedWatchlist}
                onSelectWatchlist={setSelectedWatchlist}
            />

            {/* Main content */}
            <div className="flex flex-col flex-1 min-w-0">
                <Header timePeriod={timePeriod} setTimePeriod={setTimePeriod} />
                <BubbleCanvas timePeriod={timePeriod} selectedSymbols={getSelectedSymbols()} />
            </div>
        </div>
    )
}

export default function Home() {
    return (
        <ThemeProvider>
            <IndexContent />
        </ThemeProvider>
    )
}
