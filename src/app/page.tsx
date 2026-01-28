"use client"

import { useState, useCallback } from "react"
import { Header } from "~/components/Header"
import { BubbleCanvas } from "~/components/BubbleCanvas"
import { Sidebar } from "~/components/Sidebar"
import { StockDetailModal } from "~/components/StockDetailModal"
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

// Stock name mapping
const STOCK_NAMES: Record<string, string> = {
    "BBCA": "Bank Central Asia Tbk.",
    "BBRI": "Bank Rakyat Indonesia (Persero) Tbk.",
    "BMRI": "Bank Mandiri (Persero) Tbk.",
    "BBNI": "Bank Negara Indonesia (Persero) Tbk.",
    "ASII": "Astra International Tbk.",
    "TLKM": "Telkom Indonesia (Persero) Tbk.",
    "UNVR": "Unilever Indonesia Tbk.",
    "GOTO": "GoTo Gojek Tokopedia Tbk.",
    "BUKA": "Bukalapak.com Tbk.",
    "EMTK": "Elang Mahkota Teknologi Tbk.",
    "ARTO": "Bank Jago Tbk.",
    "ADRO": "Adaro Energy Indonesia Tbk.",
    "ANTM": "Aneka Tambang Tbk.",
}

// Sample watchlist stocks (for demo)
const SAMPLE_WATCHLIST_STOCKS: Record<number, string[]> = {
    1: ["BBCA", "BBRI", "BMRI", "BBNI"],
    2: ["GOTO", "BUKA", "EMTK", "ARTO"],
}

interface StockData {
    symbol: string
    name: string
    price: number
    change: number
    changes: {
        h: number
        d: number
        w: number
        m: number
        y: number
    }
}

function IndexContent() {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("1D")
    const [selectedIndex, setSelectedIndex] = useState<string | null>(null)
    const [selectedWatchlist, setSelectedWatchlist] = useState<number | null>(null)

    // Stock detail modal state  
    const [selectedStock, setSelectedStock] = useState<StockData | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    // Search open state - shared between Header and Sidebar for mobile UX
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    // Handle stock selection from search
    const handleSelectStock = useCallback((symbol: string, name: string) => {
        // Generate mock data (will be replaced with real DB data)
        const mockChange = (Math.random() - 0.5) * 10
        setSelectedStock({
            symbol,
            name,
            price: Math.round(1000 + Math.random() * 50000),
            change: mockChange,
            changes: {
                h: (Math.random() - 0.5) * 5,
                d: mockChange,
                w: (Math.random() - 0.5) * 20,
                m: (Math.random() - 0.5) * 30,
                y: (Math.random() - 0.5) * 100,
            },
        })
        setIsDetailOpen(true)
    }, [])

    // Determine which stocks to display based on filter selection
    const getSelectedSymbols = (): string[] => {
        if (selectedWatchlist && SAMPLE_WATCHLIST_STOCKS[selectedWatchlist]) {
            return SAMPLE_WATCHLIST_STOCKS[selectedWatchlist]
        }
        return IDX80_STOCKS
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header - full width on top */}
            <Header
                timePeriod={timePeriod}
                setTimePeriod={setTimePeriod}
                onSelectStock={handleSelectStock}
                isSearchOpen={isSearchOpen}
                setIsSearchOpen={setIsSearchOpen}
            />

            {/* Content area - sidebar + bubble canvas */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Sidebar
                    selectedIndex={selectedIndex}
                    onSelectIndex={setSelectedIndex}
                    selectedWatchlist={selectedWatchlist}
                    onSelectWatchlist={setSelectedWatchlist}
                    isSearchOpen={isSearchOpen}
                />

                {/* Bubble Canvas */}
                <BubbleCanvas timePeriod={timePeriod} selectedSymbols={getSelectedSymbols()} />
            </div>

            {/* Stock Detail Modal */}
            <StockDetailModal
                stock={selectedStock}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
            />
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
