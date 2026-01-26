"use client"

import { useState } from "react"
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Search,
    Plus,
    Star,
    Newspaper,
    Calendar,
    BarChart3,
    Settings,
    X,
    Menu,
    TrendingUp,
    Layers,
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

interface SidebarProps {
    selectedIndex: string | null
    onSelectIndex: (indexKode: string | null) => void
    selectedWatchlist: number | null
    onSelectWatchlist: (watchlistId: number | null) => void
}

export function Sidebar({
    selectedIndex,
    onSelectIndex,
    selectedWatchlist,
    onSelectWatchlist,
}: SidebarProps) {
    const { theme } = useTheme()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [showIndices, setShowIndices] = useState(true)
    const [showWatchlists, setShowWatchlists] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeNav, setActiveNav] = useState<string | null>(null)

    const filteredIndices = SAMPLE_INDICES.filter(
        (idx) =>
            idx.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            idx.nama.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleIndexSelect = (kode: string) => {
        if (selectedIndex === kode) {
            onSelectIndex(null) // Deselect
        } else {
            onSelectIndex(kode)
            onSelectWatchlist(null) // Clear watchlist selection
        }
    }

    const handleWatchlistSelect = (id: number) => {
        if (selectedWatchlist === id) {
            onSelectWatchlist(null)
        } else {
            onSelectWatchlist(id)
            onSelectIndex(null) // Clear index selection
        }
    }

    const navItems = [
        { id: "news", icon: Newspaper, label: "News" },
        { id: "calendar", icon: Calendar, label: "Calendar" },
        { id: "brokers", icon: BarChart3, label: "Top Brokers" },
        { id: "settings", icon: Settings, label: "Settings" },
    ]

    // Mobile toggle button (fixed position)
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

    // Sidebar content
    const SidebarContent = () => (
        <div
            className={`h-full flex flex-col transition-all duration-300 ${isCollapsed ? "w-16" : "w-72"
                }`}
            style={{
                backgroundColor: theme.headerBg,
                borderRight: `1px solid ${theme.headerBorder}`,
            }}
        >
            {/* Header with collapse toggle */}
            <div
                className="flex items-center justify-between p-3 border-b"
                style={{ borderColor: theme.headerBorder }}
            >
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <TrendingUp size={20} style={{ color: theme.accent }} />
                        <span
                            className="font-bold text-sm"
                            style={{ color: theme.textPrimary }}
                        >
                            FILTERS
                        </span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-md hover:opacity-80 transition-opacity hidden md:block"
                    style={{ color: theme.textSecondary }}
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {!isCollapsed && (
                    <>
                        {/* Search */}
                        <div className="p-3">
                            <div
                                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                                style={{
                                    backgroundColor: theme.inputBg,
                                    border: `1px solid ${theme.inputBorder}`,
                                }}
                            >
                                <Search size={16} style={{ color: theme.textSecondary }} />
                                <input
                                    type="text"
                                    placeholder="Search index..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent text-sm outline-none flex-1"
                                    style={{ color: theme.textPrimary }}
                                />
                            </div>
                        </div>

                        {/* Indices Section */}
                        <div className="px-3 pb-2">
                            <button
                                onClick={() => setShowIndices(!showIndices)}
                                className="flex items-center justify-between w-full py-2"
                                style={{ color: theme.textSecondary }}
                            >
                                <div className="flex items-center gap-2">
                                    <Layers size={16} />
                                    <span className="text-xs font-semibold uppercase tracking-wider">
                                        Indices
                                    </span>
                                </div>
                                {showIndices ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>

                            {showIndices && (
                                <div className="space-y-1 mt-1">
                                    {filteredIndices.map((idx) => (
                                        <button
                                            key={idx.id}
                                            onClick={() => handleIndexSelect(idx.kode)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${selectedIndex === idx.kode ? "font-medium" : ""
                                                }`}
                                            style={{
                                                backgroundColor:
                                                    selectedIndex === idx.kode
                                                        ? `${theme.accent}20`
                                                        : "transparent",
                                                color:
                                                    selectedIndex === idx.kode
                                                        ? theme.accent
                                                        : theme.textPrimary,
                                                border:
                                                    selectedIndex === idx.kode
                                                        ? `1px solid ${theme.accent}40`
                                                        : "1px solid transparent",
                                            }}
                                        >
                                            <div className="font-medium">{idx.kode}</div>
                                            <div
                                                className="text-xs truncate"
                                                style={{ color: theme.textSecondary }}
                                            >
                                                {idx.nama}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Watchlists Section */}
                        <div className="px-3 pb-2 border-t" style={{ borderColor: theme.headerBorder }}>
                            <button
                                onClick={() => setShowWatchlists(!showWatchlists)}
                                className="flex items-center justify-between w-full py-2 mt-2"
                                style={{ color: theme.textSecondary }}
                            >
                                <div className="flex items-center gap-2">
                                    <Star size={16} />
                                    <span className="text-xs font-semibold uppercase tracking-wider">
                                        Watchlists
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Plus
                                        size={14}
                                        className="hover:opacity-80 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            // TODO: Open create watchlist modal
                                        }}
                                    />
                                    {showWatchlists ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </button>

                            {showWatchlists && (
                                <div className="space-y-1 mt-1">
                                    {SAMPLE_WATCHLISTS.map((wl) => (
                                        <button
                                            key={wl.id}
                                            onClick={() => handleWatchlistSelect(wl.id)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all`}
                                            style={{
                                                backgroundColor:
                                                    selectedWatchlist === wl.id
                                                        ? `${theme.accent}20`
                                                        : "transparent",
                                                color:
                                                    selectedWatchlist === wl.id
                                                        ? theme.accent
                                                        : theme.textPrimary,
                                                border:
                                                    selectedWatchlist === wl.id
                                                        ? `1px solid ${theme.accent}40`
                                                        : "1px solid transparent",
                                            }}
                                        >
                                            <div className="font-medium flex items-center gap-2">
                                                <Star size={14} />
                                                {wl.name}
                                            </div>
                                            <div
                                                className="text-xs"
                                                style={{ color: theme.textSecondary }}
                                            >
                                                {wl.stocks.length} stocks
                                            </div>
                                        </button>
                                    ))}

                                    {/* Add new watchlist button */}
                                    <button
                                        className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 hover:opacity-80"
                                        style={{
                                            color: theme.textSecondary,
                                            border: `1px dashed ${theme.headerBorder}`,
                                        }}
                                    >
                                        <Plus size={14} />
                                        Create Watchlist
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Collapsed state - show icons only */}
                {isCollapsed && (
                    <div className="flex flex-col items-center gap-2 p-2 mt-2">
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className="p-2 rounded-lg transition-all"
                            style={{
                                backgroundColor: selectedIndex ? `${theme.accent}20` : "transparent",
                                color: selectedIndex ? theme.accent : theme.textSecondary,
                            }}
                            title="Indices"
                        >
                            <Layers size={20} />
                        </button>
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className="p-2 rounded-lg transition-all"
                            style={{
                                backgroundColor: selectedWatchlist ? `${theme.accent}20` : "transparent",
                                color: selectedWatchlist ? theme.accent : theme.textSecondary,
                            }}
                            title="Watchlists"
                        >
                            <Star size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom navigation */}
            <div
                className="border-t p-2"
                style={{ borderColor: theme.headerBorder }}
            >
                <div
                    className={`flex ${isCollapsed ? "flex-col items-center gap-2" : "justify-around"
                        }`}
                >
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveNav(activeNav === item.id ? null : item.id)}
                            className={`p-2 rounded-lg transition-all ${isCollapsed ? "" : "flex-1"
                                }`}
                            style={{
                                backgroundColor:
                                    activeNav === item.id ? `${theme.accent}20` : "transparent",
                                color:
                                    activeNav === item.id ? theme.accent : theme.textSecondary,
                            }}
                            title={item.label}
                        >
                            <item.icon size={18} className="mx-auto" />
                            {!isCollapsed && (
                                <span className="text-xs block mt-1 text-center">{item.label}</span>
                            )}
                        </button>
                    ))}
                </div>
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

            {/* Mobile sidebar (slide-in) */}
            <div
                className={`fixed top-0 left-0 h-full z-40 transform transition-transform duration-300 md:hidden ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <SidebarContent />
            </div>

            {/* Desktop sidebar (always visible) */}
            <div className="hidden md:block h-full">
                <SidebarContent />
            </div>
        </>
    )
}
