"use client"

import { useTheme } from "~/contexts/ThemeContext"
import { StockDetailContent } from "./StockDetailContent"

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
    indices?: string[]
}

interface Watchlist {
    id: number
    name: string
    stocks: string[]
}

interface StockDetailModalProps {
    stock: StockData | null
    isOpen: boolean
    onClose: () => void
    watchlists?: Watchlist[]
    favorites?: string[]
    hiddenStocks?: string[]
    onToggleFavorite?: (symbol: string) => void
    onToggleHidden?: (symbol: string) => void
    onToggleWatchlistStock?: (watchlistId: number, symbol: string) => void
}

export function StockDetailModal({
    stock,
    isOpen,
    onClose,
    watchlists = [],
    favorites = [],
    hiddenStocks = [],
    onToggleFavorite,
    onToggleHidden,
    onToggleWatchlistStock
}: StockDetailModalProps) {
    const { theme } = useTheme()

    if (!isOpen || !stock) return null

    return (
        <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <StockDetailContent
                stock={stock}
                onClose={onClose}
                watchlists={watchlists}
                favorites={favorites}
                hiddenStocks={hiddenStocks}
                onToggleFavorite={onToggleFavorite}
                onToggleHidden={onToggleHidden}
                onToggleWatchlistStock={onToggleWatchlistStock}
                isModal={true}
            />
        </div>
    )
}
