"use client"

import { useEffect, useRef } from "react"
import { BubblePhysics, type TimePeriod } from "~/lib/bubble-physics"
import { useTheme } from "~/contexts/ThemeContext"

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

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        // IMPORTANT: Set canvas dimensions with devicePixelRatio for sharp Retina display
        const dpr = window.devicePixelRatio || 1
        const displayWidth = container.clientWidth
        const displayHeight = container.clientHeight

        canvas.width = displayWidth * dpr
        canvas.height = displayHeight * dpr
        canvas.style.width = `${displayWidth}px`
        canvas.style.height = `${displayHeight}px`

        const ctx = canvas.getContext('2d')
        ctx?.scale(dpr, dpr)

        // Initialize physics engine only once
        if (!physicsRef.current) {
            physicsRef.current = new BubblePhysics(canvas, timePeriod, theme.bubble)
        } else {
            // When only timeframe changes, smoothly animate size changes
            physicsRef.current.updateTimePeriod(timePeriod)
        }

        let animationFrameId: number
        const animate = () => {
            // Skip updates when tab is not visible (saves CPU)
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

            // Pass display dimensions (not scaled) to physics
            physicsRef.current?.updateCanvasBounds(displayWidth, displayHeight)
        })
        resizeObserver.observe(container)

        return () => {
            cancelAnimationFrame(animationFrameId)
            resizeObserver.disconnect()
        }
    }, [timePeriod, selectedSymbols, theme.bubble])

    // Update bubble styling when theme changes
    useEffect(() => {
        if (physicsRef.current) {
            physicsRef.current.updateBubbleStyle(theme.bubble)
        }
    }, [theme])

    // Get background style
    const backgroundStyle = theme.backgroundGradient
        ? { background: theme.backgroundGradient }
        : { backgroundColor: theme.background }

    return (
        <div
            ref={containerRef}
            className="flex-1 w-full h-[calc(100vh-73px)] overflow-hidden theme-transition"
            style={backgroundStyle}
        >
            <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />
        </div>
    )
}
