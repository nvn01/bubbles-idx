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
    Edit2,
    Check,
    ArrowLeft,
    Trash2,
    Save,
    Search,
} from "lucide-react"
import { useTheme } from "~/contexts/ThemeContext"

interface IndexData {
    id: number
    kode: string
    nama: string
}

interface Watchlist {
    id: number
    name: string
    stocks: string[]
}

interface CalendarEvent {
    id: number
    kode_emiten: string
    description: string
    location: string | null
}

interface CalendarDay {
    date: string
    events: CalendarEvent[]
}

interface BrokerData {
    rank: number
    kode: string
    nama: string
    value: number
    volume: number
    frequency: number
}

type DrawerType = "indices" | "watchlist" | "news" | "calendar" | "brokers" | "settings" | null

interface SidebarProps {
    selectedIndex: string | null
    onSelectIndex: (indexKode: string | null) => void
    selectedWatchlist: number | null
    onSelectWatchlist: (watchlistId: number | null) => void
    isSearchOpen?: boolean
    watchlists: Watchlist[]
    onCreateWatchlist: (name: string, stocks: string[]) => void
    onUpdateWatchlist: (id: number, name: string, stocks: string[]) => void
    onDeleteWatchlist: (id: number) => void
}

export function Sidebar({
    selectedIndex,
    onSelectIndex,
    selectedWatchlist,
    onSelectWatchlist,
    isSearchOpen,
    watchlists,
    onCreateWatchlist,
    onUpdateWatchlist,
    onDeleteWatchlist,
}: SidebarProps) {
    const { theme } = useTheme()
    const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const indicesScrollRef = useRef<HTMLDivElement>(null)
    const scrollPositionRef = useRef<number>(0)



    // Indices Search State
    const [indicesSearch, setIndicesSearch] = useState("")
    const [editingWatchlist, setEditingWatchlist] = useState<Watchlist | null>(null)
    const [editName, setEditName] = useState("")
    const [editSearch, setEditSearch] = useState("")
    const [editSelectedStocks, setEditSelectedStocks] = useState<string[]>([])

    // Available stocks for adding (mock for now, ideally fetch from API)
    const [allStocks, setAllStocks] = useState<IndexData[]>([])

    // Calendar State
    const [calendarData, setCalendarData] = useState<CalendarDay[]>([])
    const [isLoadingCalendar, setIsLoadingCalendar] = useState(false)

    // Brokers State
    const [brokersData, setBrokersData] = useState<BrokerData[]>([])
    const [isLoadingBrokers, setIsLoadingBrokers] = useState(false)
    const [brokerStartDate, setBrokerStartDate] = useState<string>(
        new Date().toISOString().split('T')[0] || ''
    )
    const [brokerEndDate, setBrokerEndDate] = useState<string>(
        new Date().toISOString().split('T')[0] || ''
    )
    const [brokerSortBy, setBrokerSortBy] = useState<'value' | 'volume' | 'frequency'>('value')

    // Fetch all stocks for the "Available" list in edit mode
    useEffect(() => {
        if (editingWatchlist) {
            // Using indices API as a source of stocks for now
            fetch("/api/indices/IDX80") // Just fetching one index to get some stocks
                .then(res => res.json())
                .then(data => {
                    if (data.symbols) {
                        // Map simply to { code, nama } format if possible, or just use strings
                        setAllStocks(data.symbols.map((s: string) => ({ id: 0, kode: s, nama: "" })))
                    }
                })
                .catch(e => console.error("Error fetching stocks for edit:", e))
        }
    }, [editingWatchlist])

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

    // Fetch calendar events when drawer opens
    useEffect(() => {
        if (activeDrawer === "calendar" && calendarData.length === 0) {
            setIsLoadingCalendar(true)
            fetch("/api/calendar?upcoming=true&limit=50")
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setCalendarData(data)
                    }
                    setIsLoadingCalendar(false)
                })
                .catch(err => {
                    console.error("Error fetching calendar:", err)
                    setIsLoadingCalendar(false)
                })
        }
    }, [activeDrawer, calendarData.length])

    // Fetch brokers when drawer opens or filters change
    useEffect(() => {
        if (activeDrawer === "brokers") {
            setIsLoadingBrokers(true)
            fetch(`/api/brokers?startDate=${brokerStartDate}&endDate=${brokerEndDate}&sortBy=${brokerSortBy}&limit=20`)
                .then(res => res.json())
                .then(data => {
                    if (data.brokers && Array.isArray(data.brokers)) {
                        setBrokersData(data.brokers)
                    }
                    setIsLoadingBrokers(false)
                })
                .catch(err => {
                    console.error("Error fetching brokers:", err)
                    setIsLoadingBrokers(false)
                })
        }
    }, [activeDrawer, brokerStartDate, brokerEndDate, brokerSortBy])

    const filteredIndices = indices.filter(
        (idx) =>
            idx.kode.toLowerCase().includes(indicesSearch.toLowerCase()) ||
            idx.nama.toLowerCase().includes(indicesSearch.toLowerCase())
    )


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
        }
    }

    const startEditingKey = (watchlist: Watchlist | null) => {
        if (watchlist) {
            setEditingWatchlist(watchlist)
            setEditName(watchlist.name)
            setEditSelectedStocks([...watchlist.stocks])
        } else {
            // Creating new
            setEditingWatchlist({ id: 0, name: "", stocks: [] })
            setEditName("")
            setEditSelectedStocks([])
        }
        setEditSearch("")
    }

    const saveEditing = () => {
        if (!editingWatchlist) return

        const finalName = editName.trim() || "Untitled Watchlist"

        if (editingWatchlist.id === 0) {
            onCreateWatchlist(finalName, editSelectedStocks)
        } else {
            onUpdateWatchlist(editingWatchlist.id, finalName, editSelectedStocks)
        }
        setEditingWatchlist(null)
    }

    // Toggle stock in edit list
    const toggleEditStock = (symbol: string) => {
        if (editSelectedStocks.includes(symbol)) {
            setEditSelectedStocks(prev => prev.filter(s => s !== symbol))
        } else {
            setEditSelectedStocks(prev => [symbol, ...prev]) // Add to top
        }
    }

    const toggleDrawer = (drawer: DrawerType) => {
        setActiveDrawer(activeDrawer === drawer ? null : drawer)
        setEditingWatchlist(null) // Reset edit mode when closing/switching
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

        // --- EDIT WATCHLIST VIEW ---
        if (type === "watchlist" && editingWatchlist) {
            const isNew = editingWatchlist.id === 0

            // Filter available stocks based on search and exclude selected
            const filteredAvailable = allStocks.filter(s =>
                !editSelectedStocks.includes(s.kode) &&
                (s.kode.toLowerCase().includes(editSearch.toLowerCase()) ||
                    s.nama.toLowerCase().includes(editSearch.toLowerCase()))
            ).slice(0, 50) // Limit results for perf

            return (
                <div className="flex flex-col h-full">
                    {/* Edit Header */}
                    <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: theme.headerBorder }}>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setEditingWatchlist(null)}
                                className="p-1 rounded hover:bg-white/5"
                            >
                                <ArrowLeft size={16} style={{ color: theme.textSecondary }} />
                            </button>
                            <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>
                                {isNew ? "Create Watchlist" : "Edit Watchlist"}
                            </span>
                        </div>
                        <button
                            onClick={saveEditing}
                            className="p-1.5 rounded bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            title="Save"
                        >
                            <Save size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
                        {/* Name Input */}
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: theme.textSecondary }}>Name</label>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                style={{
                                    backgroundColor: theme.inputBg,
                                    border: `1px solid ${theme.inputBorder}`,
                                    color: theme.textPrimary
                                }}
                                placeholder="Watchlist Name"
                            />
                        </div>

                        {/* Search Add */}
                        <div>
                            <label className="text-xs font-medium mb-1 block" style={{ color: theme.textSecondary }}>Add Stocks</label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5" size={14} style={{ color: theme.textSecondary }} />
                                <input
                                    type="text"
                                    value={editSearch}
                                    onChange={(e) => setEditSearch(e.target.value.toUpperCase())}
                                    className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none"
                                    style={{
                                        backgroundColor: theme.inputBg,
                                        border: `1px solid ${theme.inputBorder}`,
                                        color: theme.textPrimary,
                                        "--placeholder-color": theme.textSecondary
                                    } as React.CSSProperties}
                                    placeholder="Search details..."
                                />
                            </div>
                        </div>

                        {/* Selected List */}
                        {editSelectedStocks.length > 0 && (
                            <div>
                                <label className="text-xs font-medium mb-1 block" style={{ color: theme.textSecondary }}>
                                    Selected ({editSelectedStocks.length})
                                </label>
                                <div className="space-y-1">
                                    {editSelectedStocks.map(symbol => (
                                        <div
                                            key={symbol}
                                            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm group"
                                            style={{ backgroundColor: `${theme.accent}10` }}
                                        >
                                            <span style={{ color: theme.textPrimary }}>{symbol}</span>
                                            <button
                                                onClick={() => toggleEditStock(symbol)}
                                                className="opacity-60 hover:opacity-100 hover:text-red-400"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Available List Result */}
                        {editSearch && (
                            <div>
                                <label className="text-xs font-medium mb-1 block" style={{ color: theme.textSecondary }}>
                                    Available
                                </label>
                                <div className="space-y-1">
                                    {filteredAvailable.map(stock => (
                                        <button
                                            key={stock.kode}
                                            onClick={() => toggleEditStock(stock.kode)}
                                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left hover:opacity-80 transition-all"
                                            style={{ border: `1px solid ${theme.headerBorder}` }}
                                        >
                                            <div>
                                                <div style={{ color: theme.textPrimary }}>{stock.kode}</div>
                                                {stock.nama && <div className="text-xs opacity-60">{stock.nama}</div>}
                                            </div>
                                            <Plus size={14} style={{ color: theme.textSecondary }} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!isNew && (
                            <div className="pt-4 border-t" style={{ borderColor: theme.headerBorder }}>
                                <button
                                    onClick={() => {
                                        if (confirm("Delete this watchlist?")) {
                                            onDeleteWatchlist(editingWatchlist.id)
                                            setEditingWatchlist(null)
                                        }
                                    }}
                                    className="w-full py-2 flex items-center justify-center gap-2 text-red-400 hover:bg-red-400/10 rounded-lg text-xs transition-colors"
                                >
                                    <Trash2 size={14} /> Delete Watchlist
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )
        }

        const renderIndicesContent = () => (
            <div className="p-3 h-full flex flex-col text-left">
                {/* Search */}
                <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3 shrink-0"
                    style={{
                        backgroundColor: theme.inputBg,
                        border: `1px solid ${theme.inputBorder}`,
                    }}
                >
                    <Search size={14} style={{ color: theme.textSecondary }} />
                    <input
                        type="text"
                        placeholder="Search indices..."
                        value={indicesSearch}
                        onChange={(e) => setIndicesSearch(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="bg-transparent text-sm outline-none flex-1"
                        style={{
                            color: theme.textPrimary,
                            "--placeholder-color": theme.textSecondary
                        } as React.CSSProperties}
                    />
                </div>

                {/* Index list */}
                <div ref={indicesScrollRef} className="space-y-1 flex-1 overflow-y-auto custom-scrollbar min-h-0">
                    {isLoadingIndices ? (
                        <div className="text-center py-4 text-sm" style={{ color: theme.textSecondary }}>
                            Loading indices...
                        </div>
                    ) : filteredIndices.length === 0 ? (
                        <div className="text-center py-4 text-sm" style={{ color: theme.textSecondary }}>
                            No indices found
                        </div>
                    ) : (
                        filteredIndices.map((idx) => (
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
            <div className="p-3 h-full flex flex-col text-left">
                <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar min-h-0">
                    {watchlists.map((wl) => (
                        <div
                            key={wl.id}
                            className="group relative"
                        >
                            <button
                                onClick={() => handleWatchlistSelect(wl.id)}
                                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all pr-8"
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

                            {/* Edit Button - Only visible on hover */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    startEditingKey(wl)
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                                style={{ color: theme.textSecondary }}
                                title="Edit Watchlist"
                            >
                                <Edit2 size={12} />
                            </button>
                        </div>
                    ))}

                    {/* Add new watchlist */}
                    <button
                        onClick={() => startEditingKey(null)}
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

        const renderCalendarContent = () => {
            // Helper to format date nicely
            const formatDate = (dateStr: string) => {
                const date = new Date(dateStr)
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const tomorrow = new Date(today)
                tomorrow.setDate(tomorrow.getDate() + 1)

                if (date.toDateString() === today.toDateString()) {
                    return "Today"
                } else if (date.toDateString() === tomorrow.toDateString()) {
                    return "Tomorrow"
                } else {
                    return date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    })
                }
            }

            return (
                <div className="p-3 h-full flex flex-col">
                    {isLoadingCalendar ? (
                        <div className="text-center py-4 text-sm" style={{ color: theme.textSecondary }}>
                            Loading events...
                        </div>
                    ) : calendarData.length === 0 ? (
                        <div className="text-center py-4">
                            <Calendar size={32} className="mx-auto mb-2 opacity-50" style={{ color: theme.textSecondary }} />
                            <p className="text-sm" style={{ color: theme.textSecondary }}>
                                No upcoming events
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                            {calendarData.map((day) => (
                                <div key={day.date}>
                                    {/* Date Header */}
                                    <div
                                        className="text-xs font-semibold uppercase tracking-wide mb-2 sticky top-0 py-1"
                                        style={{
                                            color: theme.accent,
                                            backgroundColor: theme.headerBg
                                        }}
                                    >
                                        {formatDate(day.date)}
                                    </div>

                                    {/* Events for this date */}
                                    <div className="space-y-1">
                                        {day.events.map((event) => (
                                            <div
                                                key={event.id}
                                                className="px-3 py-2 rounded-lg text-sm"
                                                style={{
                                                    backgroundColor: `${theme.textSecondary}10`,
                                                    border: `1px solid ${theme.headerBorder}`
                                                }}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span
                                                        className="font-bold text-xs px-1.5 py-0.5 rounded"
                                                        style={{
                                                            backgroundColor: `${theme.accent}20`,
                                                            color: theme.accent
                                                        }}
                                                    >
                                                        {event.kode_emiten}
                                                    </span>
                                                </div>
                                                <p style={{ color: theme.textPrimary }} className="text-sm">
                                                    {event.description}
                                                </p>
                                                {event.location && (
                                                    <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                                                        📍 {event.location}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )
        }

        const renderBrokersContent = () => {
            // Format large numbers
            const formatNumber = (num: number): string => {
                if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T'
                if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
                if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
                if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
                return num.toString()
            }

            // Format date for display
            const formatDisplayDate = (dateStr: string) => {
                const date = new Date(dateStr)
                return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
            }

            const SortButton = ({ field, label }: { field: 'value' | 'volume' | 'frequency', label: string }) => (
                <button
                    onClick={() => setBrokerSortBy(field)}
                    className={`text-xs font-medium px-1 py-0.5 rounded transition-all ${brokerSortBy === field ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
                    style={{
                        color: brokerSortBy === field ? theme.accent : theme.textSecondary,
                        backgroundColor: brokerSortBy === field ? `${theme.accent}20` : 'transparent'
                    }}
                >
                    {label}
                </button>
            )

            return (
                <div className="p-3 h-full flex flex-col">
                    {/* Date Range Display */}
                    <div
                        className="text-center mb-3 py-2 px-3 rounded-lg text-sm font-medium"
                        style={{
                            backgroundColor: `${theme.textSecondary}10`,
                            color: theme.textPrimary
                        }}
                    >
                        {formatDisplayDate(brokerStartDate)} - {formatDisplayDate(brokerEndDate)}
                    </div>

                    {/* Date Inputs */}
                    <div className="flex gap-2 mb-3">
                        <input
                            type="date"
                            value={brokerStartDate}
                            onChange={(e) => setBrokerStartDate(e.target.value)}
                            className="flex-1 px-2 py-1.5 rounded text-xs outline-none"
                            style={{
                                backgroundColor: theme.inputBg,
                                border: `1px solid ${theme.inputBorder}`,
                                color: theme.textPrimary
                            }}
                        />
                        <input
                            type="date"
                            value={brokerEndDate}
                            onChange={(e) => setBrokerEndDate(e.target.value)}
                            className="flex-1 px-2 py-1.5 rounded text-xs outline-none"
                            style={{
                                backgroundColor: theme.inputBg,
                                border: `1px solid ${theme.inputBorder}`,
                                color: theme.textPrimary
                            }}
                        />
                    </div>

                    {/* Table Header with Sort */}
                    <div
                        className="grid grid-cols-12 gap-1 px-2 py-1.5 text-xs font-semibold border-b mb-1"
                        style={{
                            color: theme.textSecondary,
                            borderColor: theme.headerBorder
                        }}
                    >
                        <div className="col-span-1">#</div>
                        <div className="col-span-2">Code</div>
                        <div className="col-span-3 text-right"><SortButton field="value" label="T.Val" /></div>
                        <div className="col-span-3 text-right"><SortButton field="volume" label="T.Vol" /></div>
                        <div className="col-span-3 text-right"><SortButton field="frequency" label="T.Freq" /></div>
                    </div>

                    {/* Broker List */}
                    {isLoadingBrokers ? (
                        <div className="text-center py-4 text-sm" style={{ color: theme.textSecondary }}>
                            Loading brokers...
                        </div>
                    ) : brokersData.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-sm" style={{ color: theme.textSecondary }}>
                                No data for selected dates
                            </p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5">
                            {brokersData.map((broker) => (
                                <div
                                    key={broker.kode}
                                    className="grid grid-cols-12 gap-1 px-2 py-1.5 rounded text-xs hover:opacity-80 transition-all"
                                    style={{ backgroundColor: `${theme.textSecondary}08` }}
                                    title={broker.nama}
                                >
                                    <div className="col-span-1 font-bold" style={{ color: theme.accent }}>
                                        {broker.rank}
                                    </div>
                                    <div className="col-span-2 font-medium truncate" style={{ color: theme.textPrimary }}>
                                        {broker.kode}
                                    </div>
                                    <div
                                        className="col-span-3 text-right"
                                        style={{ color: brokerSortBy === 'value' ? theme.bubble.positiveColor : theme.textSecondary }}
                                    >
                                        {formatNumber(broker.value)}
                                    </div>
                                    <div
                                        className="col-span-3 text-right"
                                        style={{ color: brokerSortBy === 'volume' ? theme.bubble.positiveColor : theme.textSecondary }}
                                    >
                                        {formatNumber(broker.volume)}
                                    </div>
                                    <div
                                        className="col-span-3 text-right"
                                        style={{ color: brokerSortBy === 'frequency' ? theme.bubble.positiveColor : theme.textSecondary }}
                                    >
                                        {formatNumber(broker.frequency)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )
        }

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
                return renderCalendarContent()
            case "brokers":
                return renderBrokersContent()
            case "settings":
                return renderSettingsContent()
            default:
                return null
        }
    }

    // Helper to render the main layout content
    // We use a function call instead of a component to avoid remounting issues
    const renderSidebarLayout = () => (
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
                        {/* Drawer header - ONLY show if NOT editing (Edit view has its own header) */}
                        {!editingWatchlist && (
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
                        )}

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
                {renderSidebarLayout()}
            </div>

            {/* Desktop sidebar */}
            <div className="hidden md:block h-full">
                {renderSidebarLayout()}
            </div>
        </>
    )
}
