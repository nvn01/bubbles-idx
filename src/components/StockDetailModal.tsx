"use client"

import { useState, useEffect, useMemo } from "react"
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
    indices?: string[]
}

interface ChartPoint {
    time: string
    value: number
}

interface NewsItem {
    id: number
    title: string
    excerpt: string
    source: string
    time: string
    url: string
    imageUrl: string | null
}

interface StockDetailModalProps {
    stock: StockData | null
    isOpen: boolean
    onClose: () => void
}

export function StockDetailModal({ stock, isOpen, onClose }: StockDetailModalProps) {
    const { theme } = useTheme()
    const [chartTimeframe, setChartTimeframe] = useState<string>("1D")
    const [fetchedDetails, setFetchedDetails] = useState<StockData | null>(null)
    const [chartData, setChartData] = useState<ChartPoint[]>([])
    const [news, setNews] = useState<NewsItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Reset state when stock changes
    useEffect(() => {
        setFetchedDetails(null)
        setChartData([])
        setNews([])
        setIsLoading(true)
    }, [stock?.symbol])

    // Fetch data when modal opens or timeframe changes
    useEffect(() => {
        if (!isOpen || !stock) return

        const fetchData = async () => {
            setIsLoading(true)
            try {
                // Fetch details and news only once per stock open
                const promises: Promise<Response>[] = []

                // Always fetch chart for current timeframe
                promises.push(fetch(`/api/stocks/${stock.symbol}/chart?range=${chartTimeframe}`))

                // Fetch details/news if not yet fetched
                if (!fetchedDetails) {
                    promises.push(fetch(`/api/stocks/${stock.symbol}`))
                    promises.push(fetch(`/api/stocks/${stock.symbol}/news`))
                }

                const results = await Promise.all(promises)

                const chartRes = results[0]
                if (chartRes && chartRes.ok) {
                    const data = await chartRes.json()
                    // Validate array
                    if (Array.isArray(data)) setChartData(data)
                }

                if (!fetchedDetails && results[1] && results[2]) {
                    const detailsRes = results[1]
                    const newsRes = results[2]

                    if (detailsRes.ok) setFetchedDetails(await detailsRes.json())
                    if (newsRes.ok) setNews(await newsRes.json())
                }

            } catch (error) {
                console.error("Failed to fetch stock data", error)
            } finally {
                setIsLoading(false)
            }
        }

        const timeoutId = setTimeout(fetchData, 100) // Small delay for animation
        return () => clearTimeout(timeoutId)
    }, [stock, isOpen, chartTimeframe, fetchedDetails]) // precise deps

    // Generate chart path
    const chartPath = useMemo(() => {
        if (chartData.length < 2) return null

        const points = chartData.map(d => d.value)
        const min = Math.min(...points)
        const max = Math.max(...points)
        const range = max - min || 1

        const width = 500
        const height = 200

        const path = points.map((price, i) => {
            const x = (i / (points.length - 1)) * width
            const y = height - ((price - min) / range) * height
            return `${i === 0 ? "M" : "L"} ${x},${y}`
        }).join(" ")

        return { path, width, height, min, max }
    }, [chartData])

    if (!isOpen || !stock) return null

    // Use fetched details if available, otherwise fallback to props (which might be lighter)
    const activeStock = fetchedDetails || stock

    const timeframes = [
        { key: "1H", value: activeStock.changes?.h || 0 },
        { key: "1D", value: activeStock.changes?.d || 0 },
        { key: "1W", value: activeStock.changes?.w || activeStock.changes?.d * 5 || 0 }, // Fallback logic
        { key: "1M", value: activeStock.changes?.m || 0 },
        { key: "1Y", value: activeStock.changes?.y || 0 },
    ]

    const chartTimeframes = ["1H", "1D", "1W", "1M", "3M", "1Y", "5Y"]

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

    const isPositive = activeStock.change >= 0

    return (
        <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row overflow-y-auto md:overflow-hidden"
                style={{
                    backgroundColor: theme.headerBg,
                    border: `1px solid ${theme.headerBorder}`,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* LEFT COLUMN */}
                <div
                    className="w-full md:w-80 flex-shrink-0 md:overflow-y-auto md:max-h-[90vh] custom-scrollbar border-b md:border-b-0 md:border-r"
                    style={{ borderColor: theme.headerBorder }}
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
                                    {activeStock.symbol.slice(0, 2)}
                                </div>
                                <span className="font-bold text-xl" style={{ color: theme.textPrimary }}>
                                    {activeStock.symbol}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button style={{ color: theme.textSecondary }} className="hover:opacity-70 p-1">
                                    <Star size={20} />
                                </button>
                                {/* Mobile close button */}
                                <button
                                    onClick={onClose}
                                    className="md:hidden p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                                    style={{
                                        backgroundColor: `${theme.textSecondary}20`,
                                        color: theme.textSecondary
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-bold" style={{ color: getChangeColor(activeStock.change) }}>
                                Rp {activeStock.price.toLocaleString("id-ID")}
                            </span>
                            <span className="font-semibold" style={{ color: getChangeColor(activeStock.change) }}>
                                {formatChange(activeStock.change)}
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
                                    {activeStock.name}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span style={{ color: theme.textSecondary }}>Indices</span>
                                <span className="font-medium text-right max-w-[160px] truncate" style={{ color: theme.textPrimary }}>
                                    {activeStock.indices?.join(", ") || "-"}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span style={{ color: theme.textSecondary }}>Market Status</span>
                                <span className="font-medium" style={{ color: theme.bubble.positiveColor }}>Open</span>
                            </div>
                        </div>

                        <a
                            href={`https://www.idx.co.id/id/perusahaan-tercatat/profil-perusahaan-tercatat/${activeStock.symbol}`}
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
                <div className="flex-1 flex flex-col min-w-0 bg-transparent">
                    {/* Chart header */}
                    <div
                        className="p-4 border-b flex items-center justify-between flex-wrap gap-2"
                        style={{ borderColor: theme.headerBorder }}
                    >
                        <h3 className="font-semibold" style={{ color: theme.textPrimary }}>
                            {activeStock.symbol} Chart
                        </h3>
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                            {chartTimeframes.map((tf) => (
                                <button
                                    key={tf}
                                    onClick={() => setChartTimeframe(tf)}
                                    className="px-3 py-1.5 rounded text-xs font-medium transition-all flex-shrink-0"
                                    style={{
                                        backgroundColor: chartTimeframe === tf ? theme.accent : "transparent",
                                        color: chartTimeframe === tf ? theme.headerBg : theme.textSecondary,
                                    }}
                                >
                                    {tf}
                                </button>
                            ))}
                            {/* Desktop close button */}
                            <button
                                onClick={onClose}
                                className="hidden md:flex ml-2 p-2 rounded-full hover:opacity-70 transition-opacity"
                                style={{
                                    backgroundColor: `${theme.textSecondary}20`,
                                    color: theme.textSecondary
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div className="flex-1 p-4 min-h-[250px] flex flex-col relative">
                        {isLoading && chartData.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="animate-pulse" style={{ color: theme.textSecondary }}>Loading Chart...</span>
                            </div>
                        ) : chartPath ? (
                            <>
                                <div className="flex justify-between items-center mb-2">
                                    <div
                                        className="text-xs px-2 py-1 rounded"
                                        style={{
                                            backgroundColor: theme.headerBg,
                                            color: theme.textSecondary,
                                            border: `1px solid ${theme.headerBorder}`
                                        }}
                                    >
                                        High: Rp {chartPath.max.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                                    </div>
                                    <div
                                        className="text-xs px-2 py-1 rounded flex items-center gap-1"
                                        style={{
                                            backgroundColor: theme.headerBg,
                                            color: getChangeColor(activeStock.change),
                                            border: `1px solid ${theme.headerBorder}`
                                        }}
                                    >
                                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        Rp {activeStock.price.toLocaleString("id-ID")}
                                    </div>
                                </div>
                                <div
                                    className="flex-1 rounded-lg p-2 w-full"
                                    style={{ backgroundColor: `${theme.textSecondary}08` }}
                                >
                                    <svg
                                        width="100%"
                                        height="100%"
                                        viewBox={`0 0 ${chartPath.width} ${chartPath.height}`}
                                        preserveAspectRatio="none"
                                        className="overflow-visible"
                                    >
                                        <defs>
                                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor={getChangeColor(activeStock.change)} stopOpacity="0.3" />
                                                <stop offset="100%" stopColor={getChangeColor(activeStock.change)} stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d={`${chartPath.path} L ${chartPath.width},${chartPath.height} L 0,${chartPath.height} Z`}
                                            fill="url(#areaGradient)"
                                        />
                                        <path
                                            d={chartPath.path}
                                            fill="none"
                                            stroke={getChangeColor(activeStock.change)}
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span style={{ color: theme.textSecondary }}>No Chart Data Available</span>
                            </div>
                        )}
                    </div>

                    {/* Latest News */}
                    <div
                        className="p-4 border-t flex-1 overflow-y-auto custom-scrollbar"
                        style={{ borderColor: theme.headerBorder }}
                    >
                        <h3 className="font-semibold text-sm mb-3" style={{ color: theme.textPrimary }}>
                            Latest News
                        </h3>
                        {news.length > 0 ? (
                            <div className="space-y-3">
                                {news.map((item) => (
                                    <a
                                        key={item.id}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex gap-3 hover:bg-black/5 p-2 rounded transition-colors group"
                                    >
                                        {item.imageUrl && (
                                            <div
                                                className="w-16 h-12 rounded flex-shrink-0 bg-cover bg-center"
                                                style={{ backgroundImage: `url(${item.imageUrl})` }}
                                            />
                                        )}
                                        {!item.imageUrl && (
                                            <div
                                                className="w-16 h-12 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold"
                                                style={{ backgroundColor: `${theme.textSecondary}20`, color: theme.textSecondary }}
                                            >
                                                NEWS
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className="text-sm font-medium line-clamp-2 mb-1 group-hover:text-blue-500 transition-colors"
                                                style={{ color: theme.textPrimary }}
                                            >
                                                {item.title}
                                            </p>
                                            <p className="text-xs" style={{ color: theme.textSecondary }}>
                                                {item.source} · {new Date(item.time).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-center py-4" style={{ color: theme.textSecondary }}>
                                No news available.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
