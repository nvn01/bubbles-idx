"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { useTheme } from "~/contexts/ThemeContext"

// Sample stock data (will be replaced with DB data)
const SAMPLE_STOCKS = [
    { symbol: "BBCA", name: "Bank Central Asia Tbk." },
    { symbol: "BBRI", name: "Bank Rakyat Indonesia (Persero) Tbk." },
    { symbol: "BMRI", name: "Bank Mandiri (Persero) Tbk." },
    { symbol: "BBNI", name: "Bank Negara Indonesia (Persero) Tbk." },
    { symbol: "TLKM", name: "Telkom Indonesia (Persero) Tbk." },
    { symbol: "ASII", name: "Astra International Tbk." },
    { symbol: "UNVR", name: "Unilever Indonesia Tbk." },
    { symbol: "GOTO", name: "GoTo Gojek Tokopedia Tbk." },
    { symbol: "BUKA", name: "Bukalapak.com Tbk." },
    { symbol: "EMTK", name: "Elang Mahkota Teknologi Tbk." },
    { symbol: "ARTO", name: "Bank Jago Tbk." },
    { symbol: "ADRO", name: "Adaro Energy Indonesia Tbk." },
    { symbol: "ANTM", name: "Aneka Tambang Tbk." },
    { symbol: "ICBP", name: "Indofood CBP Sukses Makmur Tbk." },
    { symbol: "INDF", name: "Indofood Sukses Makmur Tbk." },
    { symbol: "KLBF", name: "Kalbe Farma Tbk." },
    { symbol: "MYOR", name: "Mayora Indah Tbk." },
    { symbol: "PGAS", name: "Perusahaan Gas Negara Tbk." },
    { symbol: "PTBA", name: "Bukit Asam Tbk." },
    { symbol: "SMGR", name: "Semen Indonesia (Persero) Tbk." },
]

interface SearchModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectStock: (symbol: string, name: string) => void
    initialQuery?: string
}

export function SearchModal({ isOpen, onClose, onSelectStock, initialQuery = "" }: SearchModalProps) {
    const { theme } = useTheme()
    const [query, setQuery] = useState(initialQuery)
    const inputRef = useRef<HTMLInputElement>(null)

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
            if (initialQuery) {
                setQuery(initialQuery)
            }
        }
    }, [isOpen, initialQuery])

    // Reset query when closing
    useEffect(() => {
        if (!isOpen) {
            setQuery("")
        }
    }, [isOpen])

    // Filter stocks based on query
    const filteredStocks = SAMPLE_STOCKS.filter(
        (stock) =>
            stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
            stock.name.toLowerCase().includes(query.toLowerCase())
    )

    const handleSelectStock = (symbol: string, name: string) => {
        onSelectStock(symbol, name)
        onClose()
    }

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            onClose()
        } else if (e.key === "Enter" && filteredStocks.length > 0) {
            const first = filteredStocks[0]
            if (first) {
                handleSelectStock(first.symbol, first.name)
            }
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20 px-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-xl overflow-hidden shadow-2xl"
                style={{
                    backgroundColor: theme.headerBg,
                    border: `1px solid ${theme.headerBorder}`,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search input */}
                <div
                    className="flex items-center gap-3 p-4 border-b"
                    style={{ borderColor: theme.headerBorder }}
                >
                    <Search size={20} style={{ color: theme.textSecondary }} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search stocks by symbol or name..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent text-base outline-none"
                        style={{ color: theme.textPrimary }}
                        autoComplete="off"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="p-1 rounded hover:opacity-70"
                            style={{ color: theme.textSecondary }}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {query === "" ? (
                        <div className="p-4 text-center text-sm" style={{ color: theme.textSecondary }}>
                            Type to search stocks...
                        </div>
                    ) : filteredStocks.length === 0 ? (
                        <div className="p-4 text-center text-sm" style={{ color: theme.textSecondary }}>
                            No stocks found for "{query}"
                        </div>
                    ) : (
                        <div className="p-2">
                            {filteredStocks.map((stock) => (
                                <button
                                    key={stock.symbol}
                                    onClick={() => handleSelectStock(stock.symbol, stock.name)}
                                    className="w-full text-left px-3 py-3 rounded-lg hover:opacity-80 transition-all flex items-center gap-3"
                                    style={{
                                        backgroundColor: "transparent",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = `${theme.accent}15`
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "transparent"
                                    }}
                                >
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                                        style={{
                                            backgroundColor: `${theme.accent}20`,
                                            color: theme.accent,
                                        }}
                                    >
                                        {stock.symbol.slice(0, 2)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-semibold" style={{ color: theme.textPrimary }}>
                                            {stock.symbol}
                                        </div>
                                        <div className="text-sm truncate" style={{ color: theme.textSecondary }}>
                                            {stock.name}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                <div
                    className="px-4 py-2 border-t text-xs flex gap-4"
                    style={{ borderColor: theme.headerBorder, color: theme.textSecondary }}
                >
                    <span><kbd className="px-1.5 py-0.5 rounded bg-gray-700 text-gray-300">↵</kbd> to select</span>
                    <span><kbd className="px-1.5 py-0.5 rounded bg-gray-700 text-gray-300">Esc</kbd> to close</span>
                </div>
            </div>
        </div>
    )
}
