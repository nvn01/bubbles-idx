"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "~/components/Header"
import { BubbleCanvas } from "~/components/BubbleCanvas"
import { Sidebar } from "~/components/Sidebar"
import { SearchModal } from "~/components/SearchModal"
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

    // Search modal state
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchInitialQuery, setSearchInitialQuery] = useState("")

    // Stock detail modal state  
    const [selectedStock, setSelectedStock] = useState<StockData | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    // Global keyboard listener for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if already in an input or modal is open
            const target = e.target as HTMLElement
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
                return
            }

            // Open search on any letter key press
            if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9]/)) {
                e.preventDefault()
                setSearchInitialQuery(e.key.toUpperCase())
                setIsSearchOpen(true)
            }

            // Also open on Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault()
                setSearchInitialQuery("")
                setIsSearchOpen(true)
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

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
            <Header timePeriod={timePeriod} setTimePeriod={setTimePeriod} />

            {/* Content area - sidebar + bubble canvas */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Sidebar
                    selectedIndex={selectedIndex}
                    onSelectIndex={setSelectedIndex}
                    selectedWatchlist={selectedWatchlist}
                    onSelectWatchlist={setSelectedWatchlist}
                    onOpenSearch={() => {
                        setSearchInitialQuery("")
                        setIsSearchOpen(true)
                    }}
                />

                {/* Bubble Canvas */}
                <BubbleCanvas timePeriod={timePeriod} selectedSymbols={getSelectedSymbols()} />
            </div>

            {/* Search Modal */}
            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => {
                    setIsSearchOpen(false)
                    setSearchInitialQuery("")
                }}
                onSelectStock={handleSelectStock}
                initialQuery={searchInitialQuery}
            />

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
