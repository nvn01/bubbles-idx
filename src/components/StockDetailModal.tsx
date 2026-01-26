"use client"

import { X, Star, TrendingUp, TrendingDown } from "lucide-react"
import { useTheme } from "~/contexts/ThemeContext"

interface StockData {
    symbol: string
    name: string
    price: number
    change: number // current selected timeframe change
    changes: {
        h: number  // 1 Hour
        d: number  // 1 Day
        w: number  // 1 Week
        m: number  // 1 Month
        y: number  // 1 Year
    }
    priceHistory?: number[] // for mini chart
}

interface StockDetailModalProps {
    stock: StockData | null
    isOpen: boolean
    onClose: () => void
}

export function StockDetailModal({ stock, isOpen, onClose }: StockDetailModalProps) {
    const { theme } = useTheme()

    if (!isOpen || !stock) return null

    const timeframes = [
        { key: "h", label: "1H", value: stock.changes.h },
        { key: "d", label: "1D", value: stock.changes.d },
        { key: "w", label: "1W", value: stock.changes.w },
        { key: "m", label: "1M", value: stock.changes.m },
        { key: "y", label: "1Y", value: stock.changes.y },
    ]

    const formatChange = (value: number) => {
        const prefix = value >= 0 ? "+" : ""
        return `${prefix}${value.toFixed(2)}%`
    }

    const getChangeColor = (value: number) => {
        if (value > 0) return theme.bubble.positiveColor
        if (value < 0) return theme.bubble.negativeColor
        return theme.textSecondary
    }

    const getChangeBg = (value: number) => {
        if (value > 0) return `${theme.bubble.positiveColor}20`
        if (value < 0) return `${theme.bubble.negativeColor}20`
        return `${theme.textSecondary}20`
    }

    // Generate simple sparkline data from price history or mock it
    const generateSparkline = () => {
        const history = stock.priceHistory || Array.from({ length: 20 }, (_, i) =>
            stock.price * (1 + (Math.random() - 0.5) * 0.1 * (i / 20))
        )

        const min = Math.min(...history)
        const max = Math.max(...history)
        const range = max - min || 1

        const width = 280
        const height = 80
        const points = history.map((price, i) => {
            const x = (i / (history.length - 1)) * width
            const y = height - ((price - min) / range) * height
            return `${x},${y}`
        }).join(" ")

        return { points, width, height }
    }

    const sparkline = generateSparkline()
    const isPositive = stock.change >= 0

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Modal */}
                <div
                    className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
                    style={{
                        backgroundColor: theme.headerBg,
                        border: `1px solid ${theme.headerBorder}`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between p-4 border-b"
                        style={{ borderColor: theme.headerBorder }}
                    >
                        <div className="flex items-center gap-3">
                            {/* Stock icon placeholder */}
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                                style={{
                                    backgroundColor: isPositive
                                        ? `${theme.bubble.positiveColor}20`
                                        : `${theme.bubble.negativeColor}20`,
                                    color: isPositive
                                        ? theme.bubble.positiveColor
                                        : theme.bubble.negativeColor,
                                }}
                            >
                                {stock.symbol.slice(0, 2)}
                            </div>
                            <div>
                                <h2 className="font-bold text-lg" style={{ color: theme.textPrimary }}>
                                    ${stock.symbol}
                                </h2>
                                <p className="text-xs truncate max-w-[180px]" style={{ color: theme.textSecondary }}>
                                    {stock.name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                                style={{ color: theme.textSecondary }}
                                title="Add to Watchlist"
                            >
                                <Star size={18} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                                style={{ color: theme.textSecondary }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Price section */}
                    <div className="p-4">
                        <div className="flex items-baseline justify-between mb-4">
                            <span className="text-2xl font-bold" style={{ color: getChangeColor(stock.change) }}>
                                Rp {stock.price.toLocaleString("id-ID")}
                            </span>
                            <div className="flex items-center gap-1" style={{ color: getChangeColor(stock.change) }}>
                                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                <span className="font-semibold">{formatChange(stock.change)}</span>
                            </div>
                        </div>

                        {/* Mini Chart */}
                        <div
                            className="rounded-lg p-3 mb-4"
                            style={{ backgroundColor: `${theme.textSecondary}10` }}
                        >
                            <svg
                                width="100%"
                                height="80"
                                viewBox={`0 0 ${sparkline.width} ${sparkline.height}`}
                                preserveAspectRatio="none"
                            >
                                <defs>
                                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor={getChangeColor(stock.change)} stopOpacity="0.3" />
                                        <stop offset="100%" stopColor={getChangeColor(stock.change)} stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Area fill */}
                                <polygon
                                    points={`0,${sparkline.height} ${sparkline.points} ${sparkline.width},${sparkline.height}`}
                                    fill="url(#chartGradient)"
                                />
                                {/* Line */}
                                <polyline
                                    points={sparkline.points}
                                    fill="none"
                                    stroke={getChangeColor(stock.change)}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        {/* Timeframe grid */}
                        <div className="grid grid-cols-5 gap-2">
                            {timeframes.map((tf) => (
                                <div
                                    key={tf.key}
                                    className="rounded-lg p-2 text-center transition-all"
                                    style={{ backgroundColor: getChangeBg(tf.value) }}
                                >
                                    <div className="text-xs font-medium mb-1" style={{ color: theme.textSecondary }}>
                                        {tf.label}
                                    </div>
                                    <div
                                        className="text-sm font-bold"
                                        style={{ color: getChangeColor(tf.value) }}
                                    >
                                        {formatChange(tf.value)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        className="p-4 border-t flex gap-2"
                        style={{ borderColor: theme.headerBorder }}
                    >
                        <button
                            className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                            style={{
                                backgroundColor: theme.accent,
                                color: theme.headerBg,
                            }}
                        >
                            Trade
                        </button>
                        <button
                            className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                            style={{
                                backgroundColor: `${theme.textSecondary}20`,
                                color: theme.textPrimary,
                            }}
                        >
                            Details
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
