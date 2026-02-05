"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, X, Search } from "lucide-react"
import { useTheme } from "~/contexts/ThemeContext"
import { Logo } from "~/components/Logo"
import type { TimePeriod } from "~/lib/bubble-physics"
import { isMarketOpen } from "~/lib/utils"

// Sample stock data for search results
// Sample stock data removed

export function Header({
    timePeriod,
    setTimePeriod,
    onSelectStock,
    isSearchOpen,
    setIsSearchOpen,
}: {
    timePeriod: TimePeriod
    setTimePeriod: (period: TimePeriod) => void
    onSelectStock?: (symbol: string, name: string) => void
    isSearchOpen?: boolean
    setIsSearchOpen?: (open: boolean) => void
}) {
    const { theme, nextTheme, prevTheme } = useTheme()
    const [searchQuery, setSearchQuery] = useState("")
    const [isDropdownOpen, setIsDropdownOpenInternal] = useState(false)
    const [isMarketActive, setIsMarketActive] = useState(false)
    const [searchResults, setSearchResults] = useState<{ symbol: string; name: string; change: number }[]>([])
    const [isSearching, setIsSearching] = useState(false)

    // Check market status periodically
    useEffect(() => {
        setIsMarketActive(isMarketOpen())
        const interval = setInterval(() => {
            setIsMarketActive(isMarketOpen())
        }, 60000) // Check every minute
        return () => clearInterval(interval)
    }, [])

    // Search API Effect
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([])
            return
        }

        const timeoutId = setTimeout(async () => {
            setIsSearching(true)
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
                if (res.ok) {
                    const data = await res.json()
                    setSearchResults(data)
                }
            } catch (err) {
                console.error("Search failed:", err)
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [searchQuery])

    // Sync dropdown state with parent
    const setIsDropdownOpen = (open: boolean) => {
        setIsDropdownOpenInternal(open)
        setIsSearchOpen?.(open)
    }
    const searchRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

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
            // Get the currently focused element at the moment of keypress
            const activeElement = document.activeElement as HTMLElement | null

            // Skip if the header's own search input is focused
            if (inputRef.current && activeElement === inputRef.current) {
                return
            }

            // Check if any input-like element is focused
            // This handles the sidebar search input and any other inputs on the page
            if (activeElement) {
                const tagName = activeElement.tagName.toUpperCase()
                if (
                    tagName === "INPUT" ||
                    tagName === "TEXTAREA" ||
                    tagName === "SELECT" ||
                    activeElement.isContentEditable ||
                    activeElement.getAttribute("role") === "textbox"
                ) {
                    return
                }
            }

            if (e.key.length === 1 && e.key.match(/[a-zA-Z0-9]/)) {
                e.preventDefault()
                setSearchQuery(e.key.toUpperCase())
                setIsDropdownOpen(true)
                inputRef.current?.focus()
            }
        }

        // Use capture phase to ensure we check focus state before the event bubbles
        window.addEventListener("keydown", handleKeyDown, true)
        return () => window.removeEventListener("keydown", handleKeyDown, true)
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
            className="h-14 md:h-16 px-2 md:px-6 flex items-center justify-between gap-2 md:gap-6 theme-transition relative z-50"
            style={{
                backgroundColor: theme.headerBg,
                borderBottom: `1px solid ${theme.headerBorder}`
            }}
        >
            {/* Left section - Logo, Live status and time filters */}
            <div className="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
                <Logo showMonogram={true} />

                <div className="hidden md:block h-4 w-px opacity-30" style={{ backgroundColor: theme.textSecondary }} />

                {/* LIVE text on desktop, just blinking dot on mobile */}
                {/* Market Status */}
                <div className="flex items-center gap-2 flex-shrink-0" title={isMarketActive ? "Market Open (10m delay)" : "Market Closed"}>
                    <div
                        className={`w-2 h-2 rounded-full ${isMarketActive ? 'live-indicator' : ''}`}
                        style={{ backgroundColor: isMarketActive ? "#ef4444" : theme.textSecondary }}
                    />
                </div>
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

            {/* Center section - Search Input - smaller on mobile */}
            <div ref={searchRef} className="relative flex-1 min-w-0 max-w-[100px] sm:max-w-[140px] md:max-w-md">
                <div
                    className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg"
                    style={{
                        backgroundColor: theme.inputBg,
                        border: `1px solid ${theme.inputBorder}`,
                    }}
                >
                    <Search size={16} className="flex-shrink-0" style={{ color: theme.textSecondary }} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value.toUpperCase())
                            setIsDropdownOpen(true)
                        }}
                        onFocus={() => searchQuery && setIsDropdownOpen(true)}
                        className="flex-1 bg-transparent text-sm outline-none min-w-0"
                        style={{
                            color: theme.textPrimary,
                            "--placeholder-color": theme.textSecondary
                        } as React.CSSProperties}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery("")
                                setIsDropdownOpen(false)
                            }}
                            className="flex-shrink-0"
                            style={{ color: theme.textSecondary }}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Dropdown Results Panel */}
                {isDropdownOpen && searchQuery && (
                    <div
                        className="fixed left-4 right-4 top-16 md:absolute md:top-full md:left-0 md:right-0 md:mt-2 rounded-xl overflow-hidden shadow-2xl z-[60]"
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
                            {isSearching ? (
                                <div className="p-4 text-center text-sm" style={{ color: theme.textSecondary }}>Searching...</div>
                            ) : searchResults.length > 0 ? (
                                <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
                                    {searchResults.map((stock) => (
                                        <div
                                            key={stock.symbol}
                                            onClick={() => handleStockClick(stock.symbol, stock.name)}
                                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:opacity-80 transition-all cursor-pointer"
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
                                                <span className="font-bold text-sm" style={{ color: theme.accent }}>
                                                    {stock.symbol}
                                                </span>
                                                <span className="text-sm truncate" style={{ color: theme.textSecondary }}>
                                                    {stock.name}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium flex-shrink-0" style={{ color: getChangeColor(stock.change) }}>
                                                {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                                            </span>
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

            {/* Right section - Theme Switcher */}
            <div className="flex items-center flex-shrink-0 relative z-20">
                <div className="theme-switcher">
                    <button
                        onClick={prevTheme}
                        className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded border transition-opacity hover:opacity-80"
                        style={{
                            borderColor: theme.textSecondary,
                            color: theme.textSecondary,
                            backgroundColor: 'transparent'
                        }}
                        aria-label="Previous theme"
                    >
                        <ChevronLeft size={14} className="md:w-4 md:h-4" />
                    </button>

                    <span
                        className="theme-name hidden sm:block"
                        style={{ color: theme.textPrimary }}
                    >
                        {theme.name}
                    </span>

                    <button
                        onClick={nextTheme}
                        className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded border transition-opacity hover:opacity-80"
                        style={{
                            borderColor: theme.textSecondary,
                            color: theme.textSecondary,
                            backgroundColor: 'transparent'
                        }}
                        aria-label="Next theme"
                    >
                        <ChevronRight size={14} className="md:w-4 md:h-4" />
                    </button>
                </div>
            </div>
        </header>
    )
}
