"use client"

import { useState } from "react"
import {
    Search,
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

// Sample indices data (will be replaced with DB data later)
const SAMPLE_INDICES = [
    { id: 1, kode: "IHSG", nama: "Indeks Harga Saham Gabungan" },
    { id: 2, kode: "IDX80", nama: "IDX80" },
    { id: 3, kode: "LQ45", nama: "LQ45" },
    { id: 4, kode: "IDX30", nama: "IDX30" },
    { id: 5, kode: "IDXQUALITY30", nama: "IDX Quality30" },
    { id: 6, kode: "IDXVALUE30", nama: "IDX Value30" },
    { id: 7, kode: "IDXGROWTH30", nama: "IDX Growth30" },
    { id: 8, kode: "IDXESGL", nama: "IDX ESG Leaders" },
    { id: 10, kode: "IDXHIDIV20", nama: "IDX High Dividend 20" },
    { id: 11, kode: "IDXBUMN20", nama: "IDX BUMN20" },
    { id: 12, kode: "ISSI", nama: "Indeks Saham Syariah Indonesia" },
    { id: 13, kode: "JII70", nama: "Jakarta Islamic Index 70" },
    { id: 14, kode: "JII", nama: "Jakarta Islamic Index" },
    { id: 19, kode: "KOMPAS100", nama: "KOMPAS100" },
    { id: 25, kode: "SRI-KEHATI", nama: "SRI-KEHATI" },
]

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
}

export function Sidebar({
    selectedIndex,
    onSelectIndex,
    selectedWatchlist,
    onSelectWatchlist,
    onOpenSearch,
}: SidebarProps) {
    const { theme } = useTheme()
    const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const filteredIndices = SAMPLE_INDICES.filter(
        (idx) =>
            idx.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            idx.nama.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleIndexSelect = (kode: string) => {
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

    // Mobile toggle button
    const MobileToggle = () => (
        <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg transition-all"
            style={{
                backgroundColor: theme.headerBg,
                border: `1px solid ${theme.headerBorder}`,
                color: theme.textPrimary,
            }}
        >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
    )

    // Drawer content based on type
    const DrawerContent = ({ type }: { type: DrawerType }) => {
        if (!type) return null

        const renderIndicesContent = () => (
            <div className="p-3">
                {/* Search */}
                <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3"
                    style={{
                        backgroundColor: theme.inputBg,
                        border: `1px solid ${theme.inputBorder}`,
                    }}
                >
                    <Search size={14} style={{ color: theme.textSecondary }} />
                    <input
                        type="text"
                        placeholder="Search index..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-sm outline-none flex-1"
                        style={{ color: theme.textPrimary }}
                    />
                </div>

                {/* Index list */}
                <div className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {filteredIndices.map((idx) => (
                        <button
                            key={idx.id}
                            onClick={() => handleIndexSelect(idx.kode)}
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
                    ))}
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
                return renderPlaceholderContent("Settings", "App preferences and customization coming soon.")
            default:
                return null
        }
    }

    // Icon bar + drawer panel
    const SidebarContent = () => (
        <div className="h-full flex">
            {/* Icon bar */}
            <div
                className="w-14 h-full flex flex-col items-center py-3 gap-1"
                style={{
                    backgroundColor: theme.headerBg,
                    borderRight: `1px solid ${theme.headerBorder}`,
                }}
            >
                {/* Search button at top */}
                <button
                    onClick={onOpenSearch}
                    className="p-2.5 rounded-lg transition-all relative group mb-2"
                    style={{ color: theme.textSecondary }}
                    title="Search (type any letter)"
                >
                    <Search size={20} />
                    <div
                        className="absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                        style={{
                            backgroundColor: theme.headerBg,
                            color: theme.textPrimary,
                            border: `1px solid ${theme.headerBorder}`,
                        }}
                    >
                        Search
                    </div>
                </button>

                <div className="w-8 border-b mb-2" style={{ borderColor: theme.headerBorder }} />
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
                            <DrawerContent type={activeDrawer} />
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

            {/* Mobile sidebar */}
            <div
                className={`fixed top-0 left-0 h-full z-40 transform transition-transform duration-300 md:hidden ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
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
