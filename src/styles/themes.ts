export interface BubbleStyle {
    positiveColor: string;
    negativeColor: string;
    positiveGlow: string;
    negativeGlow: string;
    fillColor: string;
    textColor: string;
    borderWidth: number;
    glowIntensity: number;
}

export interface Theme {
    id: string;
    name: string;
    // Background colors
    background: string;
    backgroundGradient?: string;
    // Header/Sidebar colors
    headerBg: string;
    headerBorder: string;
    sidebarBg: string;
    sidebarBorder: string;
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    // Accent colors
    accent: string;
    accentHover: string;
    // Bubble styling
    bubble: BubbleStyle;
    // Input styling
    inputBg: string;
    inputBorder: string;
    inputFocus: string;
}

export const themes: Theme[] = [
    {
        id: "default",
        name: "Midnight",
        background: "#000000",
        headerBg: "#000000",
        headerBorder: "#1f2937",
        sidebarBg: "#030712",
        sidebarBorder: "#1f2937",
        textPrimary: "#ffffff",
        textSecondary: "#9ca3af",
        textMuted: "#6b7280",
        accent: "#f97316",
        accentHover: "#ea580c",
        bubble: {
            positiveColor: "#22c55e",
            negativeColor: "#ef4444",
            positiveGlow: "rgba(34, 197, 94, 0.3)",
            negativeGlow: "rgba(239, 68, 68, 0.3)",
            fillColor: "#1a1a1a",
            textColor: "#ffffff",
            borderWidth: 3,
            glowIntensity: 0.3,
        },
        inputBg: "#111827",
        inputBorder: "#374151",
        inputFocus: "#f97316",
    },
    {
        id: "golden",
        name: "Golden Hour",
        background: "#1a1510",
        backgroundGradient: "linear-gradient(180deg, #1a1510 0%, #2d2418 40%, #3d3020 100%)",
        headerBg: "#1a1510",
        headerBorder: "#d4a574",
        sidebarBg: "#0f0d0a",
        sidebarBorder: "#b8956e",
        textPrimary: "#f5e6d3",
        textSecondary: "#d4a574",
        textMuted: "#8b7355",
        accent: "#e6b980",
        accentHover: "#d4a574",
        bubble: {
            positiveColor: "#c9a86c",
            negativeColor: "#a05252",
            positiveGlow: "rgba(201, 168, 108, 0.4)",
            negativeGlow: "rgba(160, 82, 82, 0.4)",
            fillColor: "#2a2318",
            textColor: "#f5e6d3",
            borderWidth: 3,
            glowIntensity: 0.4,
        },
        inputBg: "#2d2418",
        inputBorder: "#8b7355",
        inputFocus: "#e6b980",
    },
    {
        id: "sakura",
        name: "Sakura Bloom",
        background: "#1f1a1d",
        backgroundGradient: "linear-gradient(135deg, #1f1a1d 0%, #2d2329 50%, #1f1a1d 100%)",
        headerBg: "#1f1a1d",
        headerBorder: "#e8b4c8",
        sidebarBg: "#17131a",
        sidebarBorder: "#d4a5b9",
        textPrimary: "#fce4ec",
        textSecondary: "#e8b4c8",
        textMuted: "#9e7a8a",
        accent: "#f06292",
        accentHover: "#ec407a",
        bubble: {
            positiveColor: "#81c784",
            negativeColor: "#e57373",
            positiveGlow: "rgba(129, 199, 132, 0.4)",
            negativeGlow: "rgba(229, 115, 115, 0.4)",
            fillColor: "#2d2329",
            textColor: "#fce4ec",
            borderWidth: 3,
            glowIntensity: 0.45,
        },
        inputBg: "#2d2329",
        inputBorder: "#d4a5b9",
        inputFocus: "#f06292",
    },
    {
        id: "deep-sea",
        name: "Deep Sea",
        background: "#0a1628",
        backgroundGradient: "linear-gradient(180deg, #0a1628 0%, #0d1f3c 40%, #102a50 100%)",
        headerBg: "#0a1628",
        headerBorder: "#1e4976",
        sidebarBg: "#071019",
        sidebarBorder: "#1e4976",
        textPrimary: "#c8dce8",
        textSecondary: "#6a9ec9",
        textMuted: "#3d6a8a",
        accent: "#4fc3f7",
        accentHover: "#29b6f6",
        bubble: {
            positiveColor: "#26a69a",
            negativeColor: "#ef5350",
            positiveGlow: "rgba(38, 166, 154, 0.45)",
            negativeGlow: "rgba(239, 83, 80, 0.45)",
            fillColor: "#0d1f3c",
            textColor: "#c8dce8",
            borderWidth: 3,
            glowIntensity: 0.5,
        },
        inputBg: "#0d1f3c",
        inputBorder: "#1e4976",
        inputFocus: "#4fc3f7",
    },
    {
        id: "synthwave",
        name: "Synthwave",
        background: "#0d0221",
        backgroundGradient: "linear-gradient(180deg, #0d0221 0%, #1a0533 40%, #2d1b4e 100%)",
        headerBg: "#0d0221",
        headerBorder: "#ff00ff",
        sidebarBg: "#090118",
        sidebarBorder: "#00ffff",
        textPrimary: "#ff6ec7",
        textSecondary: "#00ffff",
        textMuted: "#9d4edd",
        accent: "#ff00ff",
        accentHover: "#ff6ec7",
        bubble: {
            positiveColor: "#00ffff",
            negativeColor: "#ff00ff",
            positiveGlow: "rgba(0, 255, 255, 0.5)",
            negativeGlow: "rgba(255, 0, 255, 0.5)",
            fillColor: "#1a0533",
            textColor: "#ffffff",
            borderWidth: 2,
            glowIntensity: 0.6,
        },
        inputBg: "#1a0533",
        inputBorder: "#9d4edd",
        inputFocus: "#ff00ff",
    },
    {
        id: "forest",
        name: "Enchanted Forest",
        background: "#0a1f0a",
        backgroundGradient: "linear-gradient(180deg, #0a1f0a 0%, #132613 40%, #1a3318 100%)",
        headerBg: "#0a1f0a",
        headerBorder: "#2d5a2d",
        sidebarBg: "#071407",
        sidebarBorder: "#2d5a2d",
        textPrimary: "#c5e1c5",
        textSecondary: "#7cb87c",
        textMuted: "#4a7c4a",
        accent: "#50c878",
        accentHover: "#3cb371",
        bubble: {
            positiveColor: "#50c878",
            negativeColor: "#cd5c5c",
            positiveGlow: "rgba(80, 200, 120, 0.4)",
            negativeGlow: "rgba(205, 92, 92, 0.4)",
            fillColor: "#132613",
            textColor: "#c5e1c5",
            borderWidth: 2,
            glowIntensity: 0.35,
        },
        inputBg: "#132613",
        inputBorder: "#2d5a2d",
        inputFocus: "#50c878",
    },
    {
        id: "monochrome",
        name: "Monochrome",
        background: "#0a0a0a",
        backgroundGradient: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)",
        headerBg: "#0a0a0a",
        headerBorder: "#333333",
        sidebarBg: "#050505",
        sidebarBorder: "#333333",
        textPrimary: "#ffffff",
        textSecondary: "#b0b0b0",
        textMuted: "#666666",
        accent: "#ffffff",
        accentHover: "#e0e0e0",
        bubble: {
            positiveColor: "#ffffff",
            negativeColor: "#808080",
            positiveGlow: "rgba(255, 255, 255, 0.25)",
            negativeGlow: "rgba(128, 128, 128, 0.25)",
            fillColor: "#1a1a1a",
            textColor: "#ffffff",
            borderWidth: 1,
            glowIntensity: 0.2,
        },
        inputBg: "#1a1a1a",
        inputBorder: "#333333",
        inputFocus: "#ffffff",
    },
    {
        id: "lava",
        name: "Volcanic",
        background: "#1a0a0a",
        backgroundGradient: "linear-gradient(180deg, #1a0a0a 0%, #2d1010 40%, #401515 100%)",
        headerBg: "#1a0a0a",
        headerBorder: "#8b0000",
        sidebarBg: "#120707",
        sidebarBorder: "#8b0000",
        textPrimary: "#ffd4a3",
        textSecondary: "#ff6b35",
        textMuted: "#994422",
        accent: "#ff4500",
        accentHover: "#ff6347",
        bubble: {
            positiveColor: "#ff6b35",
            negativeColor: "#8b0000",
            positiveGlow: "rgba(255, 107, 53, 0.45)",
            negativeGlow: "rgba(139, 0, 0, 0.45)",
            fillColor: "#2d1010",
            textColor: "#ffd4a3",
            borderWidth: 3,
            glowIntensity: 0.5,
        },
        inputBg: "#2d1010",
        inputBorder: "#8b0000",
        inputFocus: "#ff4500",
    },
    {
        id: "arctic",
        name: "Arctic Frost",
        background: "#e8f4f8",
        backgroundGradient: "linear-gradient(180deg, #e8f4f8 0%, #d0e8f0 40%, #b8dce8 100%)",
        headerBg: "#e8f4f8",
        headerBorder: "#87ceeb",
        sidebarBg: "#f0f8ff",
        sidebarBorder: "#87ceeb",
        textPrimary: "#1a3a4a",
        textSecondary: "#3a6a7a",
        textMuted: "#6a9aaa",
        accent: "#00bfff",
        accentHover: "#1e90ff",
        bubble: {
            positiveColor: "#00bfff",
            negativeColor: "#4169e1",
            positiveGlow: "rgba(0, 191, 255, 0.3)",
            negativeGlow: "rgba(65, 105, 225, 0.3)",
            fillColor: "#d0e8f0",
            textColor: "#1a3a4a",
            borderWidth: 2,
            glowIntensity: 0.25,
        },
        inputBg: "#f0f8ff",
        inputBorder: "#87ceeb",
        inputFocus: "#00bfff",
    },
    {
        id: "terminal",
        name: "Terminal",
        background: "#0c0c0c",
        backgroundGradient: "linear-gradient(180deg, #0c0c0c 0%, #0a0a0a 100%)",
        headerBg: "#0c0c0c",
        headerBorder: "#00ff00",
        sidebarBg: "#080808",
        sidebarBorder: "#00ff00",
        textPrimary: "#00ff00",
        textSecondary: "#00cc00",
        textMuted: "#008800",
        accent: "#00ff00",
        accentHover: "#33ff33",
        bubble: {
            positiveColor: "#00ff00",
            negativeColor: "#ff0000",
            positiveGlow: "rgba(0, 255, 0, 0.4)",
            negativeGlow: "rgba(255, 0, 0, 0.4)",
            fillColor: "#0a0a0a",
            textColor: "#00ff00",
            borderWidth: 1,
            glowIntensity: 0.45,
        },
        inputBg: "#0a0a0a",
        inputBorder: "#00ff00",
        inputFocus: "#00ff00",
    },
    {
        id: "sunset",
        name: "Sunset Beach",
        background: "#1a1520",
        backgroundGradient: "linear-gradient(180deg, #1a1520 0%, #2d1f35 30%, #45283c 60%, #5c3d4a 100%)",
        headerBg: "#1a1520",
        headerBorder: "#ff7f50",
        sidebarBg: "#150f18",
        sidebarBorder: "#ff6b6b",
        textPrimary: "#ffe4c4",
        textSecondary: "#ff9f80",
        textMuted: "#b87a6a",
        accent: "#ff7f50",
        accentHover: "#ff6347",
        bubble: {
            positiveColor: "#ffa07a",
            negativeColor: "#cd5c5c",
            positiveGlow: "rgba(255, 160, 122, 0.4)",
            negativeGlow: "rgba(205, 92, 92, 0.4)",
            fillColor: "#2d1f35",
            textColor: "#ffe4c4",
            borderWidth: 2,
            glowIntensity: 0.4,
        },
        inputBg: "#2d1f35",
        inputBorder: "#b87a6a",
        inputFocus: "#ff7f50",
    },
];

// Default theme for TypeScript strict mode
const defaultTheme = themes[0]!;

export function getTheme(id: string): Theme {
    return themes.find((t) => t.id === id) ?? defaultTheme;
}

export function getNextTheme(currentId: string): Theme {
    const currentIndex = themes.findIndex((t) => t.id === currentId);
    const nextIndex = (currentIndex + 1) % themes.length;
    return themes[nextIndex] ?? defaultTheme;
}

export function getPrevTheme(currentId: string): Theme {
    const currentIndex = themes.findIndex((t) => t.id === currentId);
    const prevIndex = currentIndex === 0 ? themes.length - 1 : currentIndex - 1;
    return themes[prevIndex] ?? defaultTheme;
}
