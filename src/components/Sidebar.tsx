"use client"

import { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react"
import {
    Plus,
    Star,
    Newspaper,
    Calendar,
    BarChart3,
    Settings,
    X,
    Menu,
    Layers,
    ChevronRight,
} from "lucide-react"
import { useTheme } from "~/contexts/ThemeContext"

interface IndexData {
    id: number
    kode: string
    nama: string
}

// Sample watchlists
const SAMPLE_WATCHLISTS = [
    { id: 1, name: "Banking Favorites", stocks: ["BBCA", "BBRI", "BMRI", "BBNI"] },
    { id: 2, name: "Tech & Growth", stocks: ["GOTO", "BUKA", "EMTK", "ARTO"] },
]

type DrawerType = "indices" | "watchlist" | "news" | "calendar" | "brokers" | "settings" | null

interface SidebarProps {
    selectedIndex: string | null
    onSelectIndex: (indexKode: string | null) => void
    selectedWatchlist: number | null
    onSelectWatchlist: (watchlistId: number | null) => void
    onOpenSearch?: () => void
    isSearchOpen?: boolean
}

export function Sidebar({
    selectedIndex,
    onSelectIndex,
    selectedWatchlist,
    onSelectWatchlist,
    onOpenSearch,
    isSearchOpen,
}: SidebarProps) {
    const { theme } = useTheme()
    const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const indicesScrollRef = useRef<HTMLDivElement>(null)
    const scrollPositionRef = useRef<number>(0)

    // Save scroll position before re-render
    const saveScrollPosition = useCallback(() => {
        if (indicesScrollRef.current) {
            scrollPositionRef.current = indicesScrollRef.current.scrollTop
        }
    }, [])

    // Restore scroll position after re-render
    useLayoutEffect(() => {
        if (indicesScrollRef.current && scrollPositionRef.current > 0) {
            indicesScrollRef.current.scrollTop = scrollPositionRef.current
        }
    })

    const [indices, setIndices] = useState<IndexData[]>([])
    const [isLoadingIndices, setIsLoadingIndices] = useState(true)

    // Fetch indices from API on mount
    useEffect(() => {
        fetch("/api/indices")
            .then(res => res.json())
            .then(data => {
                // Ensure data is an array before setting
                if (Array.isArray(data)) {
                    setIndices(data)
                } else {
                    console.error("Indices API returned non-array:", data)
                    setIndices([])
                }
                setIsLoadingIndices(false)
            })
            .catch(err => {
                console.error("Error fetching indices:", err)
                setIsLoadingIndices(false)
            })
    }, [])


    const handleIndexSelect = (kode: string) => {
        console.log("[Sidebar] handleIndexSelect called with:", kode, "current selectedIndex:", selectedIndex)
        // Save scroll position before state change triggers re-render
        saveScrollPosition()
        if (selectedIndex === kode) {
            onSelectIndex(null)
        } else {
            onSelectIndex(kode)
            onSelectWatchlist(null)
        }
    }

    const handleWatchlistSelect = (id: number) => {
        if (selectedWatchlist === id) {
            onSelectWatchlist(null)
        } else {
            onSelectWatchlist(id)
            onSelectIndex(null)
        }
    }

    const toggleDrawer = (drawer: DrawerType) => {
        setActiveDrawer(activeDrawer === drawer ? null : drawer)
    }

    const navItems: { id: DrawerType; icon: typeof Layers; label: string }[] = [
        { id: "indices", icon: Layers, label: "Indices" },
        { id: "watchlist", icon: Star, label: "Watchlist" },
        { id: "news", icon: Newspaper, label: "News" },
        { id: "calendar", icon: Calendar, label: "Calendar" },
        { id: "brokers", icon: BarChart3, label: "Top Brokers" },
        { id: "settings", icon: Settings, label: "Settings" },
    ]

    // Mobile toggle button - positioned below header on mobile
    // Hidden when search dropdown is open to prevent overlap
    const MobileToggle = () => {
        if (isSearchOpen) return null

        return (
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="fixed top-[3.75rem] left-3 z-50 md:hidden p-2 rounded-lg transition-all shadow-lg"
                style={{
                    backgroundColor: theme.headerBg,
                    border: `1px solid ${theme.headerBorder}`,
                    color: theme.textPrimary,
                }}
            >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
        )
    }

    // Render drawer content based on type (NOT a component - render function to preserve focus)
    const renderDrawerContent = (type: DrawerType) => {
        if (!type) return null

        const renderIndicesContent = () => (
            <div className="p-3">

                {/* Index list */}
                <div ref={indicesScrollRef} className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {isLoadingIndices ? (
                        <div className="text-center py-4 text-sm" style={{ color: theme.textSecondary }}>
                            Loading indices...
                        </div>
                    ) : indices.length === 0 ? (
                        <div className="text-center py-4 text-sm" style={{ color: theme.textSecondary }}>
                            No indices found
                        </div>
                    ) : (
                        indices.map((idx) => (
                            <button
                                key={idx.id}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleIndexSelect(idx.kode)
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                                style={{
                                    backgroundColor: selectedIndex === idx.kode ? `${theme.accent}20` : "transparent",
                                    color: selectedIndex === idx.kode ? theme.accent : theme.textPrimary,
                                    border: selectedIndex === idx.kode ? `1px solid ${theme.accent}40` : "1px solid transparent",
                                }}
                            >
                                <div className="font-medium">{idx.kode}</div>
                                <div className="text-xs truncate" style={{ color: theme.textSecondary }}>
                                    {idx.nama}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        )

        const renderWatchlistContent = () => (
            <div className="p-3">
                <div className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {SAMPLE_WATCHLISTS.map((wl) => (
                        <button
                            key={wl.id}
                            onClick={() => handleWatchlistSelect(wl.id)}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                            style={{
                                backgroundColor: selectedWatchlist === wl.id ? `${theme.accent}20` : "transparent",
                                color: selectedWatchlist === wl.id ? theme.accent : theme.textPrimary,
                                border: selectedWatchlist === wl.id ? `1px solid ${theme.accent}40` : "1px solid transparent",
                            }}
                        >
                            <div className="font-medium flex items-center gap-2">
                                <Star size={14} />
                                {wl.name}
                            </div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>
                                {wl.stocks.length} stocks
                            </div>
                        </button>
                    ))}

                    {/* Add new watchlist */}
                    <button
                        className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 hover:opacity-80 mt-2"
                        style={{
                            color: theme.textSecondary,
                            border: `1px dashed ${theme.headerBorder}`,
                        }}
                    >
                        <Plus size={14} />
                        Create Watchlist
                    </button>
                </div>
            </div>
        )

        const renderPlaceholderContent = (title: string, description: string) => (
            <div className="p-4 text-center">
                <h3 className="font-semibold mb-2" style={{ color: theme.textPrimary }}>
                    {title}
                </h3>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                    {description}
                </p>
            </div>
        )

        const renderSettingsContent = () => (
            <div className="p-3 space-y-4">
                {/* Language */}
                <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: theme.textPrimary }}>
                        Language
                    </label>
                    <select
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{
                            backgroundColor: theme.inputBg,
                            border: `1px solid ${theme.inputBorder}`,
                            color: theme.textPrimary,
                        }}
                        defaultValue={typeof navigator !== 'undefined' && navigator.language?.startsWith('id') ? 'id' : 'en'}
                    >
                        <option value="en">English</option>
                        <option value="id">Bahasa Indonesia</option>
                    </select>
                    <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                        Change the default language
                    </p>
                </div>

                {/* Show Icons Toggle */}
                <div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                            Show Icons
                        </label>
                        <button
                            className="relative w-10 h-5 rounded-full transition-colors"
                            style={{ backgroundColor: theme.accent }}
                        >
                            <div
                                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                            />
                        </button>
                    </div>
                    <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                        Show/hide icons on the bubble
                    </p>
                </div>

                <div className="border-t pt-3" style={{ borderColor: theme.headerBorder }}>
                    {/* Report an Issue */}
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                                Report an Issue
                            </p>
                            <p className="text-xs" style={{ color: theme.textSecondary }}>
                                Report a bug or missing symbol
                            </p>
                        </div>
                        <button
                            className="px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{
                                backgroundColor: `${theme.accent}20`,
                                color: theme.accent,
                            }}
                        >
                            Report
                        </button>
                    </div>

                    {/* Contact Us */}
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                                Contact Us
                            </p>
                            <p className="text-xs" style={{ color: theme.textSecondary }}>
                                Ask information or collaboration
                            </p>
                        </div>
                        <button
                            className="px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{
                                backgroundColor: `${theme.accent}20`,
                                color: theme.accent,
                            }}
                        >
                            Contact
                        </button>
                    </div>

                    {/* Legal */}
                    <a
                        href="/legal"
                        className="block text-sm hover:opacity-80 transition-opacity"
                        style={{ color: theme.textSecondary }}
                    >
                        Terms of Service & Privacy Policy →
                    </a>
                </div>
            </div>
        )

        switch (type) {
            case "indices":
                return renderIndicesContent()
            case "watchlist":
                return renderWatchlistContent()
            case "news":
                return renderPlaceholderContent("Market News", "Latest stock market news and updates coming soon.")
            case "calendar":
                return renderPlaceholderContent("Economic Calendar", "IPO dates, earnings, dividends calendar coming soon.")
            case "brokers":
                return renderPlaceholderContent("Top Brokers", "Top broker net buy/sell data coming soon.")
            case "settings":
                return renderSettingsContent()
            default:
                return null
        }
    }

    // Icon bar + drawer panel
    const SidebarContent = () => (
        <div className="h-full flex">
            {/* Icon bar */}
            <div
                className="w-14 h-full flex flex-col items-center pt-14 md:pt-3 pb-3 gap-1"
                style={{
                    backgroundColor: theme.headerBg,
                    borderRight: `1px solid ${theme.headerBorder}`,
                }}
            >
                {navItems.map((item) => {
                    const isActive = activeDrawer === item.id
                    const hasSelection =
                        (item.id === "indices" && selectedIndex) ||
                        (item.id === "watchlist" && selectedWatchlist)

                    return (
                        <button
                            key={item.id}
                            onClick={() => toggleDrawer(item.id)}
                            className="p-2.5 rounded-lg transition-all relative group"
                            style={{
                                backgroundColor: isActive ? `${theme.accent}20` : "transparent",
                                color: isActive ? theme.accent : theme.textSecondary,
                            }}
                            title={item.label}
                        >
                            <item.icon size={20} />

                            {/* Active indicator dot */}
                            {hasSelection && !isActive && (
                                <div
                                    className="absolute top-1 right-1 w-2 h-2 rounded-full"
                                    style={{ backgroundColor: theme.accent }}
                                />
                            )}

                            {/* Tooltip */}
                            <div
                                className="absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                                style={{
                                    backgroundColor: theme.headerBg,
                                    color: theme.textPrimary,
                                    border: `1px solid ${theme.headerBorder}`,
                                }}
                            >
                                {item.label}
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Drawer panel */}
            <div
                className={`h-full overflow-hidden transition-all duration-300 ${activeDrawer ? "w-64" : "w-0"
                    }`}
                style={{
                    backgroundColor: theme.headerBg,
                    borderRight: activeDrawer ? `1px solid ${theme.headerBorder}` : "none",
                }}
            >
                {activeDrawer && (
                    <div className="h-full flex flex-col">
                        {/* Drawer header */}
                        <div
                            className="flex items-center justify-between p-3 border-b"
                            style={{ borderColor: theme.headerBorder }}
                        >
                            <span className="font-semibold text-sm uppercase tracking-wide" style={{ color: theme.textPrimary }}>
                                {navItems.find((n) => n.id === activeDrawer)?.label}
                            </span>
                            <button
                                onClick={() => setActiveDrawer(null)}
                                className="p-1 rounded hover:opacity-70"
                                style={{ color: theme.textSecondary }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Drawer content */}
                        <div className="flex-1 overflow-hidden">
                            {renderDrawerContent(activeDrawer)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <>
            <MobileToggle />

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar - positioned exactly below header (h-14 = 3.5rem) */}
            <div
                className={`fixed top-14 left-0 h-[calc(100vh-3.5rem)] z-40 transform transition-transform duration-300 md:hidden ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <SidebarContent />
            </div>

            {/* Desktop sidebar */}
            <div className="hidden md:block h-full">
                <SidebarContent />
            </div>
        </>
    )
}
