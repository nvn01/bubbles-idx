"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "~/components/Header"
import { BubbleCanvas } from "~/components/BubbleCanvas"
import { Sidebar } from "~/components/Sidebar"
import { StockDetailModal } from "~/components/StockDetailModal"
import { ThemeProvider } from "~/contexts/ThemeContext"
import { useLocalStorage, STORAGE_KEYS } from "~/lib/useLocalStorage"
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

interface Watchlist {
    id: number
    name: string
    stocks: string[]
}

// Default watchlists
const DEFAULT_WATCHLISTS: Watchlist[] = [
    {
        id: 1,
        name: "Banking Favorites",
        stocks: ["BMRI", "BBRI", "BBCA", "BBNI", "BRIS", "BNGA", "NISP"]
    },
    {
        id: 2,
        name: "50 Biggest Market Capitalization",
        stocks: [
            "BREN", "BBCA", "DSSA", "TPIA", "BBRI", "BYAN", "DCII", "BMRI", "AMMN", "TLKM",
            "BRPT", "MORA", "ASII", "CUAN", "PANI", "IMPC", "CDIA", "SRAJ", "BNLI", "BBNI",
            "FILM", "BRMS", "BUMI", "DNET", "MLPT", "MPRO", "PTRO", "UNTR", "BRIS", "UNVR",
            "RISE", "ICBP", "SMMA", "EMAS", "CASA", "HMSP", "AMRT", "ANTM", "ISAT", "CPIN",
            "GOTO", "NCKL", "EXCL", "BELI", "EMTK", "ADMR", "MBMA", "TBIG", "INDF", "MTEL"
        ]
    },
]

function IndexContent() {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("1D")

    // Persisted state using localStorage
    const [selectedIndex, setSelectedIndex, isIndexLoaded] = useLocalStorage<string>(
        STORAGE_KEYS.SELECTED_INDEX,
        "IDX80"
    )
    const [watchlists, setWatchlists] = useLocalStorage<Watchlist[]>(
        STORAGE_KEYS.WATCHLISTS,
        DEFAULT_WATCHLISTS
    )
    const [favorites, setFavorites] = useLocalStorage<string[]>(
        STORAGE_KEYS.FAVORITES,
        []
    )
    const [hiddenStocks, setHiddenStocks] = useLocalStorage<string[]>(
        STORAGE_KEYS.HIDDEN_STOCKS,
        []
    )

    // Non-persisted state
    const [selectedWatchlistId, setSelectedWatchlistId] = useState<number | null>(null)
    const [indexSymbols, setIndexSymbols] = useState<string[]>([])
    const [isLoadingIndex, setIsLoadingIndex] = useState(true)

    // Stock detail modal state  
    const [selectedStock, setSelectedStock] = useState<StockData | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    // Search open state - shared between Header and Sidebar for mobile UX
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    // Fetch symbols for the selected index (only after localStorage loaded)
    useEffect(() => {
        // Wait for localStorage to load before fetching
        if (!isIndexLoaded) return

        console.log("[Page] useEffect for selectedIndex:", selectedIndex)
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
                console.log("[Page] Fetched symbols for", selectedIndex, ":", data.symbols?.length || 0, "symbols")
                setIndexSymbols(data.symbols || [])
                setIsLoadingIndex(false)
            })
            .catch(err => {
                console.error("Error fetching index symbols:", err)
                setIndexSymbols([])
                setIsLoadingIndex(false)
            })
    }, [selectedIndex, isIndexLoaded])

    // Handle stock selection from search
    const handleSelectStock = useCallback((symbol: string, name: string) => {
        // Set basic info to show immediately while loading details
        // Or we could set `isLoading` state here if we want to show a spinner before opening

        // Reset selected stock first to clear old data
        setSelectedStock(null)
        setIsDetailOpen(true) // Open immediately, modal will show loading state if data is null

        fetch(`/api/stocks/${symbol}`)
            .then(res => {
                if (!res.ok) throw new Error("Stock not found")
                return res.json()
            })
            .then(data => {
                setSelectedStock(data)
            })
            .catch(err => {
                console.error("Error fetching stock details:", err)
                // Optionally show error toast here
                // For now, we'll close the modal or show error state in modal
                // Since StockDetailModal handles null stock gracefully (it just doesn't show much), 
                // we might want to set a specific error state or keep 'stock' null

                // If we want to show an error inside the modal:
                // We could set a special "error" stock object or handle validation in the modal
                // For this iteration, let's just alert for visibility as requested "thrown database error"
                alert(`Failed to fetch details for ${symbol}. Data might be missing in database.`)
                setIsDetailOpen(false)
            })
    }, [])

    // Handle index selection - also clears watchlist
    const handleSelectIndex = useCallback((indexKode: string | null) => {
        console.log("[Page] handleSelectIndex called with:", indexKode)
        // Set loading and clear symbols immediately to prevent flash of old content
        setIsLoadingIndex(true)
        setIndexSymbols([])
        setSelectedIndex(indexKode || "IDX80") // Default back to IDX80 if null
        setSelectedWatchlistId(null)
    }, [])

    // Handle watchlist selection - also clears index
    const handleSelectWatchlist = useCallback((watchlistId: number | null) => {
        setSelectedWatchlistId(watchlistId)
        if (watchlistId) {
            setSelectedIndex("") // Clear index when watchlist selected
        } else {
            // Reset to IDX80 when watchlist deselected
            // Set loading first to prevent flash of all stocks
            setIsLoadingIndex(true)
            setSelectedIndex("IDX80")
        }
    }, [])

    // Determine which stocks to display based on filter selection
    const getSelectedSymbols = (): string[] => {
        if (selectedWatchlistId) {
            const watchlist = watchlists.find(w => w.id === selectedWatchlistId)
            return watchlist ? watchlist.stocks : []
        }
        return indexSymbols
    }

    // CRUD Handlers for Watchlists
    const handleCreateWatchlist = (name: string, stocks: string[]) => {
        const newId = Math.max(0, ...watchlists.map(w => w.id)) + 1
        setWatchlists([...watchlists, { id: newId, name, stocks }])
        // Automatically select the new watchlist
        handleSelectWatchlist(newId)
    }

    const handleUpdateWatchlist = (id: number, name: string, stocks: string[]) => {
        setWatchlists(watchlists.map(w =>
            w.id === id ? { ...w, id, name, stocks } : w
        ))
    }

    const handleDeleteWatchlist = (id: number) => {
        setWatchlists(watchlists.filter(w => w.id !== id))
        if (selectedWatchlistId === id) {
            handleSelectWatchlist(null)
            setSelectedIndex("IDX80")
        }
    }

    // Toggle favorite status - auto-creates "Favorites" watchlist if needed
    const handleToggleFavorite = useCallback((symbol: string) => {
        const isFavorited = favorites.includes(symbol)

        if (isFavorited) {
            // Remove from favorites
            setFavorites(prev => prev.filter(s => s !== symbol))
            // Also remove from Favorites watchlist if it exists
            setWatchlists(prev => prev.map(w =>
                w.name === "Favorites"
                    ? { ...w, stocks: w.stocks.filter(s => s !== symbol) }
                    : w
            ))
        } else {
            // Add to favorites
            setFavorites(prev => [...prev, symbol])

            // Check if "Favorites" watchlist exists
            const favoritesWatchlist = watchlists.find(w => w.name === "Favorites")
            if (favoritesWatchlist) {
                // Add to existing Favorites watchlist
                setWatchlists(prev => prev.map(w =>
                    w.name === "Favorites" && !w.stocks.includes(symbol)
                        ? { ...w, stocks: [...w.stocks, symbol] }
                        : w
                ))
            } else {
                // Create new Favorites watchlist with this stock
                const newId = Math.max(0, ...watchlists.map(w => w.id)) + 1
                setWatchlists(prev => [
                    { id: newId, name: "Favorites", stocks: [symbol] },
                    ...prev
                ])
            }
        }
    }, [favorites, watchlists])

    // Toggle hidden status
    const handleToggleHidden = useCallback((symbol: string) => {
        setHiddenStocks(prev =>
            prev.includes(symbol)
                ? prev.filter(s => s !== symbol)
                : [...prev, symbol]
        )
    }, [])

    // Toggle stock in a specific watchlist
    const handleToggleWatchlistStock = useCallback((watchlistId: number, symbol: string) => {
        setWatchlists(prev => prev.map(w => {
            if (w.id !== watchlistId) return w
            const hasStock = w.stocks.includes(symbol)
            return {
                ...w,
                stocks: hasStock
                    ? w.stocks.filter(s => s !== symbol)
                    : [...w.stocks, symbol]
            }
        }))
    }, [])

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
                    selectedWatchlist={selectedWatchlistId}
                    onSelectWatchlist={handleSelectWatchlist}
                    isSearchOpen={isSearchOpen}
                    watchlists={watchlists}
                    onCreateWatchlist={handleCreateWatchlist}
                    onUpdateWatchlist={handleUpdateWatchlist}
                    onDeleteWatchlist={handleDeleteWatchlist}
                />

                {/* Bubble Canvas */}
                <BubbleCanvas
                    timePeriod={timePeriod}
                    selectedSymbols={getSelectedSymbols()}
                    isLoading={isLoadingIndex}
                    hiddenStocks={hiddenStocks}
                    watchlists={watchlists}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleHidden={handleToggleHidden}
                    onToggleWatchlistStock={handleToggleWatchlistStock}
                />
            </div>

            {/* Stock Detail Modal */}
            <StockDetailModal
                stock={selectedStock}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                watchlists={watchlists}
                favorites={favorites}
                hiddenStocks={hiddenStocks}
                onToggleFavorite={handleToggleFavorite}
                onToggleHidden={handleToggleHidden}
                onToggleWatchlistStock={handleToggleWatchlistStock}
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
