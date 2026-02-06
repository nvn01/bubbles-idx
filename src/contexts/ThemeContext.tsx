"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { type Theme, getTheme, getNextTheme, getPrevTheme } from "~/styles/themes";
import { useLocalStorage, STORAGE_KEYS } from "~/lib/useLocalStorage";

interface ThemeContextType {
    theme: Theme;
    themeId: string;
    setThemeId: (id: string) => void;
    nextTheme: () => void;
    prevTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Use localStorage for persistence, with "default" as initial value
    const [storedThemeId, setStoredThemeId, isLoaded] = useLocalStorage<string>(
        STORAGE_KEYS.THEME,
        "default"
    );

    // Local state for immediate updates (synced with localStorage)
    const [themeId, setThemeIdState] = useState("default");

    // Sync local state with localStorage once loaded
    useEffect(() => {
        if (isLoaded) {
            setThemeIdState(storedThemeId);
        }
    }, [isLoaded, storedThemeId]);

    const theme = getTheme(themeId);

    const setThemeId = useCallback((id: string) => {
        setThemeIdState(id);
        setStoredThemeId(id);
    }, [setStoredThemeId]);

    const nextTheme = useCallback(() => {
        const next = getNextTheme(themeId);
        setThemeId(next.id);
    }, [themeId, setThemeId]);

    const prevTheme = useCallback(() => {
        const prev = getPrevTheme(themeId);
        setThemeId(prev.id);
    }, [themeId, setThemeId]);

    return (
        <ThemeContext.Provider value={{ theme, themeId, setThemeId, nextTheme, prevTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
