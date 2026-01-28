"use client"

import Image from "next/image"
import { useTheme } from "~/contexts/ThemeContext"

interface LogoProps {
    showMonogram?: boolean
    className?: string
}

// Helper function to determine if a theme is light or dark based on background luminance
function isLightTheme(backgroundColor: string): boolean {
    // Parse hex color
    const hex = backgroundColor.replace("#", "")
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    return luminance > 0.5
}

export function Logo({ showMonogram = true, className = "" }: LogoProps) {
    const { theme } = useTheme()

    // Determine text color based on theme luminance
    const isLight = isLightTheme(theme.background)
    const textColor = isLight ? "#000000" : "#FFFFFF"
    const dotColor = "#FF4136" // Brand red color

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {showMonogram && (
                <Image
                    src="/favicon.svg"
                    alt="Bubbles Idx"
                    width={28}
                    height={28}
                    className="flex-shrink-0"
                />
            )}
            <span
                className="font-logo font-bold text-lg tracking-tight"
                style={{ color: textColor }}
            >
                Bubbles Idx
                <span style={{ color: dotColor }}>.</span>
            </span>
        </div>
    )
}
