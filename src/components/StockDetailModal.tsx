"use client"

import { useState } from "react"
import { X, Star, ExternalLink, TrendingUp, TrendingDown } from "lucide-react"
import { useTheme } from "~/contexts/ThemeContext"

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
    priceHistory?: number[]
}

interface StockDetailModalProps {
    stock: StockData | null
    isOpen: boolean
    onClose: () => void
}

export function StockDetailModal({ stock, isOpen, onClose }: StockDetailModalProps) {
    const { theme } = useTheme()
    const [chartTimeframe, setChartTimeframe] = useState<string>("1D")

    if (!isOpen || !stock) return null

    const timeframes = [
        { key: "1H", value: stock.changes.h },
        { key: "4H", value: stock.changes.h * 2 }, // Mock 4H
        { key: "1D", value: stock.changes.d },
        { key: "1W", value: stock.changes.w },
        { key: "1M", value: stock.changes.m },
        { key: "1Y", value: stock.changes.y },
    ]

    const chartTimeframes = ["1H", "4H", "1D", "1W", "1M", "1Y"]

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
        if (value > 0) return `${theme.bubble.positiveColor}15`
        if (value < 0) return `${theme.bubble.negativeColor}15`
        return `${theme.textSecondary}15`
    }

    // Generate chart data
    const generateChartPoints = () => {
        const points = 50
        const history = Array.from({ length: points }, (_, i) => {
            const trend = stock.change >= 0 ? 0.002 : -0.002
            return stock.price * (0.95 + Math.random() * 0.1 + trend * i)
        })

        const min = Math.min(...history)
        const max = Math.max(...history)
        const range = max - min || 1

        const width = 500
        const height = 200

        return {
            path: history.map((price, i) => {
                const x = (i / (points - 1)) * width
                const y = height - ((price - min) / range) * height
                return `${i === 0 ? "M" : "L"} ${x},${y}`
            }).join(" "),
            width,
            height,
            minPrice: min,
            maxPrice: max,
        }
    }

    const chart = generateChartPoints()
    const isPositive = stock.change >= 0

    // Mock news data
    const mockNews = [
        { title: `${stock.symbol} reports strong quarterly earnings`, source: "IDX", time: "2 hours ago" },
        { title: `Analysts upgrade ${stock.symbol} to Buy rating`, source: "Kontan", time: "5 hours ago" },
    ]

    return (
        <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Modal container - block layout on mobile for proper scroll, flex on desktop */}
            <div
                className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden"
                style={{
                    backgroundColor: theme.headerBg,
                    border: `1px solid ${theme.headerBorder}`,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Scrollable wrapper for mobile */}
                <div className="max-h-[90vh] overflow-y-auto custom-scrollbar md:overflow-hidden md:flex md:flex-row">
                    {/* LEFT COLUMN */}
                    <div
                        className="w-full md:w-80 flex-shrink-0 md:overflow-y-auto md:max-h-[90vh] custom-scrollbar"
                        style={{ borderRight: `1px solid ${theme.headerBorder}` }}
                    >
                        {/* Header */}
                        <div className="p-4 border-b" style={{ borderColor: theme.headerBorder }}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
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
                                    <span className="font-bold text-xl" style={{ color: theme.textPrimary }}>
                                        {stock.symbol}
                                    </span>
                                </div>
                                {/* Star button */}
                                <button style={{ color: theme.textSecondary }} className="hover:opacity-70 p-1">
                                    <Star size={20} />
                                </button>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl font-bold" style={{ color: getChangeColor(stock.change) }}>
                                    Rp {stock.price.toLocaleString("id-ID")}
                                </span>
                                <span className="font-semibold" style={{ color: getChangeColor(stock.change) }}>
                                    {formatChange(stock.change)}
                                </span>
                            </div>
                        </div>

                        {/* Timeframes grid */}
                        <div className="p-4 border-b" style={{ borderColor: theme.headerBorder }}>
                            <div className="grid grid-cols-3 gap-2">
                                {timeframes.map((tf) => (
                                    <div
                                        key={tf.key}
                                        className="rounded-lg p-2.5 text-center"
                                        style={{
                                            backgroundColor: getChangeBg(tf.value),
                                            border: `1px solid ${getChangeColor(tf.value)}30`
                                        }}
                                    >
                                        <div className="text-xs font-medium mb-1" style={{ color: theme.textSecondary }}>
                                            {tf.key}
                                        </div>
                                        <div className="text-sm font-bold" style={{ color: getChangeColor(tf.value) }}>
                                            {formatChange(tf.value)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stock Details */}
                        <div className="p-4">
                            <h3 className="font-semibold text-sm mb-3" style={{ color: theme.textPrimary }}>
                                Stock Details
                            </h3>
                            <div className="space-y-2.5">
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: theme.textSecondary }}>Company</span>
                                    <span className="font-medium text-right max-w-[160px] truncate" style={{ color: theme.textPrimary }}>
                                        {stock.name}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: theme.textSecondary }}>Sector</span>
                                    <span className="font-medium" style={{ color: theme.textPrimary }}>-</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: theme.textSecondary }}>Market Status</span>
                                    <span className="font-medium" style={{ color: theme.bubble.positiveColor }}>Open</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span style={{ color: theme.textSecondary }}>Previous Close</span>
                                    <span className="font-medium" style={{ color: theme.textPrimary }}>
                                        Rp {Math.round(stock.price * (1 - stock.change / 100)).toLocaleString("id-ID")}
                                    </span>
                                </div>
                            </div>

                            {/* IDX Link */}
                            <a
                                href={`https://www.idx.co.id/id/perusahaan-tercatat/profil-perusahaan-tercatat/${stock.symbol}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 w-full py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 flex items-center justify-center gap-2"
                                style={{
                                    backgroundColor: theme.accent,
                                    color: theme.headerBg,
                                }}
                            >
                                View on IDX
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        {/* Chart header */}
                        <div
                            className="p-4 border-b flex items-center justify-between flex-wrap gap-2"
                            style={{ borderColor: theme.headerBorder }}
                        >
                            <h3 className="font-semibold" style={{ color: theme.textPrimary }}>
                                {stock.symbol} Chart
                            </h3>
                            <div className="flex items-center gap-1">
                                {chartTimeframes.map((tf) => (
                                    <button
                                        key={tf}
                                        onClick={() => setChartTimeframe(tf)}
                                        className="px-3 py-1.5 rounded text-xs font-medium transition-all"
                                        style={{
                                            backgroundColor: chartTimeframe === tf ? theme.accent : "transparent",
                                            color: chartTimeframe === tf ? theme.headerBg : theme.textSecondary,
                                        }}
                                    >
                                        {tf}
                                    </button>
                                ))}
                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="ml-2 p-2 rounded-full hover:opacity-70 transition-opacity"
                                    style={{
                                        backgroundColor: `${theme.textSecondary}20`,
                                        color: theme.textSecondary
                                    }}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="flex-1 p-4 min-h-[200px]">
                            {/* Price labels - positioned outside chart */}
                            <div className="flex justify-between items-center mb-2">
                                <div
                                    className="text-xs px-2 py-1 rounded"
                                    style={{
                                        backgroundColor: theme.headerBg,
                                        color: theme.textSecondary,
                                        border: `1px solid ${theme.headerBorder}`
                                    }}
                                >
                                    High: Rp {chart.maxPrice.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                                </div>
                                <div
                                    className="text-xs px-2 py-1 rounded flex items-center gap-1"
                                    style={{
                                        backgroundColor: theme.headerBg,
                                        color: getChangeColor(stock.change),
                                        border: `1px solid ${theme.headerBorder}`
                                    }}
                                >
                                    {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    Rp {stock.price.toLocaleString("id-ID")}
                                </div>
                            </div>
                            <div
                                className="w-full h-[calc(100%-32px)] rounded-lg p-2"
                                style={{ backgroundColor: `${theme.textSecondary}08` }}
                            >

                                <svg
                                    width="100%"
                                    height="100%"
                                    viewBox={`0 0 ${chart.width} ${chart.height}`}
                                    preserveAspectRatio="none"
                                    className="overflow-visible"
                                >
                                    <defs>
                                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor={getChangeColor(stock.change)} stopOpacity="0.3" />
                                            <stop offset="100%" stopColor={getChangeColor(stock.change)} stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    {/* Area */}
                                    <path
                                        d={`${chart.path} L ${chart.width},${chart.height} L 0,${chart.height} Z`}
                                        fill="url(#areaGradient)"
                                    />
                                    {/* Line */}
                                    <path
                                        d={chart.path}
                                        fill="none"
                                        stroke={getChangeColor(stock.change)}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Latest News */}
                        <div
                            className="p-4 border-t"
                            style={{ borderColor: theme.headerBorder }}
                        >
                            <h3 className="font-semibold text-sm mb-3" style={{ color: theme.textPrimary }}>
                                Latest News
                            </h3>
                            <div className="space-y-3">
                                {mockNews.map((news, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div
                                            className="w-16 h-12 rounded flex-shrink-0"
                                            style={{ backgroundColor: `${theme.textSecondary}20` }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className="text-sm font-medium line-clamp-2 mb-1"
                                                style={{ color: theme.textPrimary }}
                                            >
                                                {news.title}
                                            </p>
                                            <p className="text-xs" style={{ color: theme.textSecondary }}>
                                                {news.source} · {news.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>{/* End scrollable wrapper */}
            </div>
        </div>
    )
}
