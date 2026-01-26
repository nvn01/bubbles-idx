"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTheme } from "~/contexts/ThemeContext"
import type { TimePeriod } from "~/lib/bubble-physics"

export function Header({
    timePeriod,
    setTimePeriod,
}: {
    timePeriod: TimePeriod
    setTimePeriod: (period: TimePeriod) => void
}) {
    const { theme, nextTheme, prevTheme } = useTheme()

    return (
        <header
            className="px-3 md:px-6 py-3 md:py-4 flex items-center justify-end gap-4 md:gap-6 flex-wrap md:flex-nowrap theme-transition"
            style={{
                backgroundColor: theme.headerBg,
                borderBottom: `1px solid ${theme.headerBorder}`
            }}
        >
            {/* Center section - Live status, time filters, and theme switcher */}
            <div className="flex items-center gap-2 md:gap-6 flex-shrink min-w-0">
                <div className="flex items-center gap-2 md:gap-3">
                    <button
                        className="font-bold text-xs md:text-sm live-indicator flex-shrink-0"
                        style={{ color: "#ef4444" }}
                    >
                        LIVE •
                    </button>
                    <div
                        className="flex gap-1 md:gap-2 pr-2 md:pr-4 overflow-x-auto"
                        style={{ borderRight: `1px solid ${theme.headerBorder}` }}
                    >
                        {(["1H", "1D", "1W", "1M", "1Y"] as const).map((time) => (
                            <button
                                key={time}
                                onClick={() => setTimePeriod(time)}
                                className="text-xs font-medium transition-colors flex-shrink-0"
                                style={{
                                    color: timePeriod === time ? theme.accent : theme.textSecondary
                                }}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Theme Switcher */}
                <div className="theme-switcher">
                    <button
                        onClick={prevTheme}
                        className="theme-arrow"
                        style={{
                            borderColor: theme.textSecondary,
                            color: theme.textSecondary,
                            backgroundColor: 'transparent'
                        }}
                        aria-label="Previous theme"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <span
                        className="theme-name hidden sm:block"
                        style={{ color: theme.textPrimary }}
                    >
                        {theme.name}
                    </span>

                    <button
                        onClick={nextTheme}
                        className="theme-arrow"
                        style={{
                            borderColor: theme.textSecondary,
                            color: theme.textSecondary,
                            backgroundColor: 'transparent'
                        }}
                        aria-label="Next theme"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    <input
                        type="text"
                        placeholder="Search"
                        className="hidden md:block px-3 md:px-4 py-1 md:py-2 rounded-lg text-sm transition-colors focus:outline-none"
                        style={{
                            backgroundColor: theme.inputBg,
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: theme.inputBorder,
                            color: theme.textPrimary
                        }}
                    />
                    <div
                        className="w-2 md:w-3 h-2 md:h-3 rounded-full flex-shrink-0 live-indicator"
                        style={{ backgroundColor: "#ef4444" }}
                    />
                </div>
            </div>
        </header>
    )
}
