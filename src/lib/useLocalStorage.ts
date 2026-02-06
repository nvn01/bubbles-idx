"use client"

import { useState, useEffect, useCallback } from "react"

/**
 * Custom hook for persisting state to localStorage
 * Handles SSR gracefully by deferring localStorage reads to useEffect
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
    // Track if we've loaded from localStorage yet (for SSR)
    const [isLoaded, setIsLoaded] = useState(false)

    // Initialize with the initial value (not localStorage - that's client-side only)
    const [storedValue, setStoredValue] = useState<T>(initialValue)

    // Load from localStorage on mount (client-side only)
    useEffect(() => {
        try {
            const item = window.localStorage.getItem(key)
            if (item !== null) {
                setStoredValue(JSON.parse(item))
            }
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error)
        }
        setIsLoaded(true)
    }, [key])

    // Setter that also persists to localStorage
    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        setStoredValue(prev => {
            const valueToStore = value instanceof Function ? value(prev) : value
            try {
                window.localStorage.setItem(key, JSON.stringify(valueToStore))
            } catch (error) {
                console.warn(`Error setting localStorage key "${key}":`, error)
            }
            return valueToStore
        })
    }, [key])

    return [storedValue, setValue, isLoaded]
}

// Storage keys for the app
export const STORAGE_KEYS = {
    THEME: "bubble-theme",
    SELECTED_INDEX: "bubble-selected-index",
    WATCHLISTS: "bubble-watchlists",
    FAVORITES: "bubble-favorites",
    HIDDEN_STOCKS: "bubble-hidden-stocks",
} as const
