"use client";

import { useEffect, useRef, useCallback } from "react";
import { BubblePhysics, type StockData } from "~/lib/bubble-physics";
import { useTheme } from "~/contexts/ThemeContext";
import type { TimePeriod } from "./Header";

interface BubbleCanvasProps {
    timePeriod: TimePeriod;
    stockData: StockData[];
}

export function BubbleCanvas({ timePeriod, stockData }: BubbleCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const physicsRef = useRef<BubblePhysics | null>(null);
    const { theme } = useTheme();

    // Helper function to get the change value based on timeframe
    // This will be used when we have real data with h/d/w/m/y fields
    const getChangeForPeriod = useCallback((stock: StockData) => {
        // For now, just return the change. Later this will switch based on h/d/w/m/y
        return stock.change;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        // Set initial canvas size
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Initialize or update physics engine
        if (!physicsRef.current && stockData.length > 0) {
            physicsRef.current = new BubblePhysics(canvas, stockData, theme.bubble);
        } else if (physicsRef.current) {
            // Update data when it changes
            physicsRef.current.updateData(stockData);
        }

        let animationFrameId: number;
        const animate = () => {
            physicsRef.current?.update();
            physicsRef.current?.render();
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        const resizeObserver = new ResizeObserver(() => {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            physicsRef.current?.updateCanvasBounds(canvas.width, canvas.height);
        });
        resizeObserver.observe(container);

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
        };
    }, [stockData, theme.bubble, getChangeForPeriod]);

    // Update bubble styling when theme changes
    useEffect(() => {
        if (physicsRef.current) {
            physicsRef.current.updateBubbleStyle(theme.bubble);
        }
    }, [theme]);

    // Get background style
    const backgroundStyle = theme.backgroundGradient
        ? { background: theme.backgroundGradient }
        : { backgroundColor: theme.background };

    return (
        <div
            ref={containerRef}
            className="flex-1 w-full h-[calc(100vh-73px)] overflow-hidden theme-transition"
            style={backgroundStyle}
        >
            {stockData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center" style={{ color: theme.textSecondary }}>
                        <div className="animate-pulse mb-4">
                            <div className="w-16 h-16 mx-auto rounded-full border-4 border-current opacity-50" />
                        </div>
                        <p className="text-lg font-medium">Loading Market Data...</p>
                        <p className="text-sm opacity-70 mt-2">Connecting to live feed</p>
                    </div>
                </div>
            ) : (
                <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-grab active:cursor-grabbing block"
                />
            )}
        </div>
    );
}
