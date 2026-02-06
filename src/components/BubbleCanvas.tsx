"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { BubblePhysics, type TimePeriod, type Bubble, type TickerData } from "~/lib/bubble-physics"
import { useTheme } from "~/contexts/ThemeContext"
import { StockDetailModal } from "./StockDetailModal"

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
}

interface Watchlist {
    id: number
    name: string
    stocks: string[]
}

export function BubbleCanvas({
    timePeriod,
    selectedSymbols,
    isLoading: externalLoading = false,
    hiddenStocks = [],
    watchlists = [],
    favorites = [],
    onToggleFavorite,
    onToggleHidden,
    onToggleWatchlistStock,
}: {
    timePeriod: TimePeriod
    selectedSymbols: string[]
    isLoading?: boolean
    hiddenStocks?: string[]
    watchlists?: Watchlist[]
    favorites?: string[]
    onToggleFavorite?: (symbol: string) => void
    onToggleHidden?: (symbol: string) => void
    onToggleWatchlistStock?: (watchlistId: number, symbol: string) => void
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const obstacleRef = useRef<HTMLDivElement>(null)
    const physicsRef = useRef<BubblePhysics | null>(null)
    const eventSourceRef = useRef<EventSource | null>(null)
    const { theme } = useTheme()

    const [selectedStock, setSelectedStock] = useState<StockData | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [allTickerData, setAllTickerData] = useState<TickerData[]>([])
    const [isDataLoading, setIsDataLoading] = useState(true)

    // Filter ticker data by selected symbols and exclude hidden stocks
    const filteredTickerData = useMemo(() => {
        let data = allTickerData
        if (selectedSymbols.length > 0) {
            const symbolSet = new Set(selectedSymbols.map(s => s.toUpperCase()))
            data = data.filter(t => symbolSet.has(t.symbol.toUpperCase()))
        }
        // Filter out hidden stocks
        if (hiddenStocks.length > 0) {
            const hiddenSet = new Set(hiddenStocks.map(s => s.toUpperCase()))
            data = data.filter(t => !hiddenSet.has(t.symbol.toUpperCase()))
        }
        return data
    }, [allTickerData, selectedSymbols, hiddenStocks])

    // Create a stable key from selectedSymbols to trigger physics recreation
    const selectedSymbolsKey = useMemo(() => selectedSymbols.sort().join(','), [selectedSymbols])

    const handleBubbleDoubleClick = useCallback((bubble: Bubble) => {
        setSelectedStock({
            symbol: bubble.symbol,
            name: bubble.name,
            price: bubble.price,
            change: bubble.change,
            changes: bubble.changes,
        })
        setIsModalOpen(true)
    }, [])

    // Connect to SSE stream for real-time updates
    useEffect(() => {
        // Connect to SSE stream
        const eventSource = new EventSource("/api/ticker/stream")
        eventSourceRef.current = eventSource

        eventSource.onmessage = (event) => {
            try {
                const data: TickerData[] = JSON.parse(event.data)
                setAllTickerData(data)
                setIsDataLoading(false)
            } catch (error) {
                console.error("Error parsing SSE data:", error)
            }
        }

        eventSource.onerror = (error) => {
            console.error("SSE connection error:", error)
            // Fallback: try REST API if SSE fails
            fetch("/api/ticker")
                .then(res => res.json())
                .then((data: TickerData[]) => {
                    setAllTickerData(data)
                    setIsDataLoading(false)
                })
                .catch(err => {
                    console.error("REST API fallback failed:", err)
                    setIsDataLoading(false) // Show fallback hardcoded data
                })
        }

        return () => {
            eventSource.close()
            eventSourceRef.current = null
        }
    }, [])

    // Reinitialize physics when selectedSymbols or timePeriod change (NOT on ticker data updates)
    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const dpr = window.devicePixelRatio || 1
        const displayWidth = container.clientWidth
        const displayHeight = container.clientHeight

        canvas.width = displayWidth * dpr
        canvas.height = displayHeight * dpr
        canvas.style.width = `${displayWidth}px`
        canvas.style.height = `${displayHeight}px`

        const ctx = canvas.getContext('2d')
        ctx?.scale(dpr, dpr)

        // Recreate physics engine when symbols or time period changes
        // Pass initial ticker data if available
        physicsRef.current = new BubblePhysics(
            canvas,
            timePeriod,
            theme.bubble,
            handleBubbleDoubleClick,
            filteredTickerData.length > 0 ? filteredTickerData : undefined
        )

        let animationFrameId: number
        const animate = () => {
            if (!document.hidden) {
                physicsRef.current?.update()
                physicsRef.current?.render()
            }
            animationFrameId = requestAnimationFrame(animate)
        }
        animate()

        const resizeObserver = new ResizeObserver(() => {
            const dpr = window.devicePixelRatio || 1
            const displayWidth = container.clientWidth
            const displayHeight = container.clientHeight

            canvas.width = displayWidth * dpr
            canvas.height = displayHeight * dpr
            canvas.style.width = `${displayWidth}px`
            canvas.style.height = `${displayHeight}px`

            const ctx = canvas.getContext('2d')
            ctx?.scale(dpr, dpr)

            physicsRef.current?.updateCanvasBounds(displayWidth, displayHeight)

            // Update obstacle position in physics engine
            if (obstacleRef.current && physicsRef.current) {
                const obs = obstacleRef.current
                physicsRef.current.setObstacle(
                    obs.offsetLeft,
                    obs.offsetTop,
                    obs.offsetWidth,
                    obs.offsetHeight
                )
            }

            physicsRef.current?.render()
        })
        resizeObserver.observe(container)

        return () => {
            cancelAnimationFrame(animationFrameId)
            resizeObserver.disconnect()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timePeriod, selectedSymbolsKey, handleBubbleDoubleClick]) // Only recreate on time period or symbol changes, NOT on ticker data updates

    // Update ticker data in physics when new data arrives (without recreating)
    useEffect(() => {
        if (physicsRef.current && filteredTickerData.length > 0) {
            physicsRef.current.updateTickerData(filteredTickerData)
        }
    }, [filteredTickerData])

    useEffect(() => {
        if (physicsRef.current) {
            physicsRef.current.updateBubbleStyle(theme.bubble)
        }
    }, [theme])

    // Build background style with optional grid pattern
    const backgroundStyle: React.CSSProperties = theme.backgroundGradient
        ? { background: theme.backgroundGradient }
        : { backgroundColor: theme.background }

    // Add grid pattern overlay if available (for Bubbles Light theme)
    if (theme.backgroundPattern) {
        backgroundStyle.backgroundImage = `${theme.backgroundPattern}${theme.backgroundGradient ? `, ${theme.backgroundGradient}` : ''}`
        backgroundStyle.backgroundSize = '60px 60px, 60px 60px, 100% 100%'
    }

    const isLoading = isDataLoading || externalLoading

    return (
        <>
            <div
                ref={containerRef}
                className="flex-1 w-full overflow-hidden theme-transition relative"
                style={backgroundStyle}
            >
                <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />
                {isLoading && (
                    <div
                        className="absolute inset-0 flex items-center justify-center z-10"
                        style={{ backgroundColor: theme.background }}
                    >
                        <div className="text-lg animate-pulse" style={{ color: theme.textPrimary }}>Loading...</div>
                    </div>
                )}

                {/* Delay Info - Acts as physics obstacle */}
                <div
                    ref={obstacleRef}
                    className="absolute bottom-4 right-4 px-3 py-1 rounded-lg border backdrop-blur-md z-0 pointer-events-none select-none flex items-center justify-center"
                    style={{
                        backgroundColor: `${theme.headerBg}80`,
                        borderColor: theme.headerBorder,
                    }}
                >
                    <span className="text-[10px] uppercase font-medium tracking-wide opacity-70 leading-none pt-[1px]" style={{ color: theme.textSecondary }}>
                        10m delay
                    </span>
                </div>
            </div>

            <StockDetailModal
                stock={selectedStock}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                watchlists={watchlists}
                favorites={favorites}
                hiddenStocks={hiddenStocks}
                onToggleFavorite={onToggleFavorite}
                onToggleHidden={onToggleHidden}
                onToggleWatchlistStock={onToggleWatchlistStock}
            />
        </>
    )
}
