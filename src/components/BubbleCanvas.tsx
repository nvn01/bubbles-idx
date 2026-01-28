"use client"

import { useEffect, useRef, useState } from "react"
import { BubblePhysics, type TimePeriod, type Bubble } from "~/lib/bubble-physics"
import { useTheme } from "~/contexts/ThemeContext"
import { StockDetailModal } from "./StockDetailModal"

// Map stock symbols to company names (will be replaced with DB data)
const STOCK_NAMES: Record<string, string> = {
    "BBCA": "Bank Central Asia Tbk.",
    "BBRI": "Bank Rakyat Indonesia (Persero) Tbk.",
    "BMRI": "Bank Mandiri (Persero) Tbk.",
    "BBNI": "Bank Negara Indonesia (Persero) Tbk.",
    "ASII": "Astra International Tbk.",
    "TLKM": "Telkom Indonesia (Persero) Tbk.",
    "UNVR": "Unilever Indonesia Tbk.",
    "GOTO": "GoTo Gojek Tokopedia Tbk.",
    "BUKA": "Bukalapak.com Tbk.",
    "EMTK": "Elang Mahkota Teknologi Tbk.",
    // Add more as needed, or fetch from DB
}

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

export function BubbleCanvas({
    timePeriod,
    selectedSymbols,
}: {
    timePeriod: TimePeriod
    selectedSymbols: string[]
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const physicsRef = useRef<BubblePhysics | null>(null)
    const { theme } = useTheme()

    const [selectedStock, setSelectedStock] = useState<StockData | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleBubbleDoubleClick = (bubble: Bubble) => {
        // Generate mock timeframe data (will be replaced with real DB data)
        const mockChanges = {
            h: (Math.random() - 0.5) * 5,
            d: bubble.change,
            w: (Math.random() - 0.5) * 20,
            m: (Math.random() - 0.5) * 30,
            y: (Math.random() - 0.5) * 100,
        }

        setSelectedStock({
            symbol: bubble.symbol,
            name: STOCK_NAMES[bubble.symbol] || `${bubble.symbol} Company`,
            price: Math.round(1000 + Math.random() * 50000),
            change: bubble.change,
            changes: mockChanges,
        })
        setIsModalOpen(true)
    }

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

        if (!physicsRef.current) {
            physicsRef.current = new BubblePhysics(
                canvas,
                timePeriod,
                theme.bubble,
                handleBubbleDoubleClick
            )
        } else {
            physicsRef.current.updateTimePeriod(timePeriod)
        }

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
        })
        resizeObserver.observe(container)

        return () => {
            cancelAnimationFrame(animationFrameId)
            resizeObserver.disconnect()
        }
    }, [timePeriod, selectedSymbols, theme.bubble])

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

    return (
        <>
            <div
                ref={containerRef}
                className="flex-1 w-full overflow-hidden theme-transition"
                style={backgroundStyle}
            >
                <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />
            </div>

            <StockDetailModal
                stock={selectedStock}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}
