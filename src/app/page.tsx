"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "~/components/Header"
import { BubbleCanvas } from "~/components/BubbleCanvas"
import { Sidebar } from "~/components/Sidebar"
import { StockDetailModal } from "~/components/StockDetailModal"
import { ThemeProvider } from "~/contexts/ThemeContext"
import type { TimePeriod } from "~/lib/bubble-physics"

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

// Sample watchlist stocks (for demo) - will be DB later
const SAMPLE_WATCHLIST_STOCKS: Record<number, string[]> = {
    1: ["BBCA", "BBRI", "BMRI", "BBNI"],
    2: ["GOTO", "BUKA", "EMTK", "ARTO"],
}

function IndexContent() {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("1D")
    const [selectedIndex, setSelectedIndex] = useState<string>("IDX80") // Default to IDX80
    const [selectedWatchlist, setSelectedWatchlist] = useState<number | null>(null)
    const [indexSymbols, setIndexSymbols] = useState<string[]>([])
    const [isLoadingIndex, setIsLoadingIndex] = useState(true)

    // Stock detail modal state  
    const [selectedStock, setSelectedStock] = useState<StockData | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    // Search open state - shared between Header and Sidebar for mobile UX
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    // Fetch symbols for the selected index
    useEffect(() => {
        if (!selectedIndex) {
            setIndexSymbols([])
            setIsLoadingIndex(false)
            return
        }

        setIsLoadingIndex(true)
        fetch(`/api/indices/${selectedIndex}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch")
                return res.json()
            })
            .then(data => {
                setIndexSymbols(data.symbols || [])
                setIsLoadingIndex(false)
            })
            .catch(err => {
                console.error("Error fetching index symbols:", err)
                setIndexSymbols([])
                setIsLoadingIndex(false)
            })
    }, [selectedIndex])

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

    // Handle index selection - also clears watchlist
    const handleSelectIndex = useCallback((indexKode: string | null) => {
        setSelectedIndex(indexKode || "IDX80") // Default back to IDX80 if null
        setSelectedWatchlist(null)
    }, [])

    // Handle watchlist selection - also clears index
    const handleSelectWatchlist = useCallback((watchlistId: number | null) => {
        setSelectedWatchlist(watchlistId)
        if (watchlistId) {
            setSelectedIndex("") // Clear index when watchlist selected
        } else {
            setSelectedIndex("IDX80") // Default back to IDX80
        }
    }, [])

    // Determine which stocks to display based on filter selection
    const getSelectedSymbols = (): string[] => {
        if (selectedWatchlist && SAMPLE_WATCHLIST_STOCKS[selectedWatchlist]) {
            return SAMPLE_WATCHLIST_STOCKS[selectedWatchlist]
        }
        return indexSymbols
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
                    onSelectIndex={handleSelectIndex}
                    selectedWatchlist={selectedWatchlist}
                    onSelectWatchlist={handleSelectWatchlist}
                    isSearchOpen={isSearchOpen}
                />

                {/* Bubble Canvas */}
                <BubbleCanvas
                    timePeriod={timePeriod}
                    selectedSymbols={getSelectedSymbols()}
                    isLoading={isLoadingIndex}
                />
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
