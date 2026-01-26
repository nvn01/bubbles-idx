"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, X, Search } from "lucide-react"
import { useTheme } from "~/contexts/ThemeContext"
import type { TimePeriod } from "~/lib/bubble-physics"

// Sample stock data for search results
const SAMPLE_STOCKS = [
    { symbol: "BBCA", name: "Bank Central Asia Tbk.", change: 2.5 },
    { symbol: "BBRI", name: "Bank Rakyat Indonesia (Persero) Tbk.", change: -1.2 },
    { symbol: "BMRI", name: "Bank Mandiri (Persero) Tbk.", change: 1.8 },
    { symbol: "BBNI", name: "Bank Negara Indonesia (Persero) Tbk.", change: 0.5 },
    { symbol: "TLKM", name: "Telkom Indonesia (Persero) Tbk.", change: -0.3 },
    { symbol: "ASII", name: "Astra International Tbk.", change: 3.1 },
    { symbol: "GOTO", name: "GoTo Gojek Tokopedia Tbk.", change: -5.2 },
    { symbol: "BUKA", name: "Bukalapak.com Tbk.", change: -2.8 },
]

export function Header({
    timePeriod,
    setTimePeriod,
    onSelectStock,
}: {
    timePeriod: TimePeriod
    setTimePeriod: (period: TimePeriod) => void
    onSelectStock?: (symbol: string, name: string) => void
}) {
    const { theme, nextTheme, prevTheme } = useTheme()
    const [searchQuery, setSearchQuery] = useState("")
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Filter stocks based on query
    const filteredStocks = searchQuery
        ? SAMPLE_STOCKS.filter(
            (stock) =>
                stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                stock.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : []

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Global keyboard listener for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
                return
            }

            if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9]/)) {
                e.preventDefault()
                setSearchQuery(e.key.toUpperCase())
                setIsDropdownOpen(true)
                inputRef.current?.focus()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    const handleStockClick = (symbol: string, name: string) => {
        onSelectStock?.(symbol, name)
        setSearchQuery("")
        setIsDropdownOpen(false)
    }

    const getChangeColor = (change: number) => {
        if (change > 0) return theme.bubble.positiveColor
        if (change < 0) return theme.bubble.negativeColor
        return theme.textSecondary
    }

    return (
        <header
            className="px-3 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4 md:gap-6 theme-transition"
            style={{
                backgroundColor: theme.headerBg,
                borderBottom: `1px solid ${theme.headerBorder}`
            }}
        >
            {/* Left section - Live status and time filters */}
            <div className="flex items-center gap-2 md:gap-3">
                <button
                    className="font-bold text-xs md:text-sm live-indicator flex-shrink-0"
                    style={{ color: "#ef4444" }}
                >
                    LIVE •
                </button>
                <div className="flex gap-1 md:gap-2">
                    {(["1H", "1D", "1W", "1M", "1Y"] as const).map((time) => (
                        <button
                            key={time}
                            onClick={() => setTimePeriod(time)}
                            className="text-xs font-medium transition-colors flex-shrink-0"
                            style={{
                                color: timePeriod === time ? theme.accent : theme.textSecondary
                            }}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            </div>

            {/* Center section - Search Input */}
            <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
                <div
                    className="flex items-center gap-2 px-4 py-2 rounded-lg"
                    style={{
                        backgroundColor: theme.inputBg,
                        border: `1px solid ${theme.inputBorder}`,
                    }}
                >
                    <Search size={16} style={{ color: theme.textSecondary }} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search stocks..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setIsDropdownOpen(true)
                        }}
                        onFocus={() => searchQuery && setIsDropdownOpen(true)}
                        className="flex-1 bg-transparent text-sm outline-none"
                        style={{ color: theme.textPrimary }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery("")
                                setIsDropdownOpen(false)
                            }}
                            style={{ color: theme.textSecondary }}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Dropdown Results Panel */}
                {isDropdownOpen && searchQuery && (
                    <div
                        className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden shadow-2xl z-50"
                        style={{
                            backgroundColor: theme.headerBg,
                            border: `1px solid ${theme.headerBorder}`,
                        }}
                    >
                        {/* Tickers Section */}
                        <div className="p-3 border-b" style={{ borderColor: theme.headerBorder }}>
                            <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: theme.textSecondary }}>
                                Tickers
                            </h4>
                            {filteredStocks.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredStocks.slice(0, 5).map((stock) => (
                                        <div
                                            key={stock.symbol}
                                            onClick={() => handleStockClick(stock.symbol, stock.name)}
                                            className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:opacity-80 transition-all cursor-pointer"
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    handleStockClick(stock.symbol, stock.name)
                                                }
                                            }}
                                            style={{ backgroundColor: `${theme.textSecondary}10` }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                                                    style={{
                                                        backgroundColor: `${theme.accent}20`,
                                                        color: theme.accent,
                                                    }}
                                                >
                                                    {stock.symbol.slice(0, 2)}
                                                </div>
                                                <div className="text-left">
                                                    <span className="font-medium text-sm" style={{ color: theme.textPrimary }}>
                                                        {stock.name}
                                                    </span>
                                                    <span className="ml-2 text-xs" style={{ color: theme.textSecondary }}>
                                                        ${stock.symbol}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium" style={{ color: getChangeColor(stock.change) }}>
                                                    {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                                                </span>
                                                <span
                                                    className="px-3 py-1 rounded text-xs font-medium"
                                                    style={{
                                                        backgroundColor: theme.accent,
                                                        color: theme.headerBg,
                                                    }}
                                                >
                                                    OPEN
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-center py-2" style={{ color: theme.textSecondary }}>
                                    No tickers found for &quot;{searchQuery}&quot;
                                </p>
                            )}
                        </div>

                        {/* News Section */}
                        <div className="p-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: theme.textSecondary }}>
                                News
                            </h4>
                            <p className="text-sm text-center py-4" style={{ color: theme.textSecondary }}>
                                No news found.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right section - Theme Switcher and Status */}
            <div className="flex items-center gap-2 md:gap-4">
                <div className="theme-switcher">
                    <button
                        onClick={prevTheme}
                        className="theme-arrow"
                        style={{
                            borderColor: theme.textSecondary,
                            color: theme.textSecondary,
                            backgroundColor: 'transparent'
                        }}
                        aria-label="Previous theme"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <span
                        className="theme-name hidden sm:block"
                        style={{ color: theme.textPrimary }}
                    >
                        {theme.name}
                    </span>

                    <button
                        onClick={nextTheme}
                        className="theme-arrow"
                        style={{
                            borderColor: theme.textSecondary,
                            color: theme.textSecondary,
                            backgroundColor: 'transparent'
                        }}
                        aria-label="Next theme"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div
                    className="w-2 md:w-3 h-2 md:h-3 rounded-full flex-shrink-0 live-indicator"
                    style={{ backgroundColor: "#ef4444" }}
                />
            </div>
        </header>
    )
}
