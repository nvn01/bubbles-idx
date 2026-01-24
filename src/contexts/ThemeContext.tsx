"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type Theme, getTheme, getNextTheme, getPrevTheme } from "~/styles/themes";

interface ThemeContextType {
    theme: Theme;
    themeId: string;
    setThemeId: (id: string) => void;
    nextTheme: () => void;
    prevTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeId, setThemeId] = useState("default");
    const theme = getTheme(themeId);

    const nextTheme = useCallback(() => {
        const next = getNextTheme(themeId);
        setThemeId(next.id);
    }, [themeId]);

    const prevTheme = useCallback(() => {
        const prev = getPrevTheme(themeId);
        setThemeId(prev.id);
    }, [themeId]);

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
