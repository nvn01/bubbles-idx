"use client"

import React, { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from "react"
import { useLocalStorage, STORAGE_KEYS } from "~/lib/useLocalStorage"

export type Language = "en" | "id"

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
    en: {
        // Sidebar nav labels
        "nav.indices": "Indices",
        "nav.watchlist": "Watchlist",
        "nav.news": "News",
        "nav.calendar": "Calendar",
        "nav.brokers": "Brokers",
        "nav.settings": "Settings",

        // Sidebar - Indices
        "indices.search": "Search indices...",
        "indices.loading": "Loading indices...",
        "indices.noResults": "No indices found",

        // Sidebar - Watchlist
        "watchlist.stocks": "stocks",
        "watchlist.create": "Create Watchlist",
        "watchlist.editTitle": "Edit Watchlist",
        "watchlist.newTitle": "New Watchlist",
        "watchlist.namePlaceholder": "Watchlist name",
        "watchlist.searchStocks": "Search stocks to add...",
        "watchlist.selectedStocks": "Selected Stocks",
        "watchlist.selectedHidden": "selected stocks hidden (don't match search)",
        "watchlist.searchResults": "Search Results",
        "watchlist.noMatches": "No matches found",
        "watchlist.delete": "Delete Watchlist",
        "watchlist.deleteConfirm": "Delete this watchlist?",
        "watchlist.save": "Save",

        // Sidebar - News
        "news.loading": "Loading news...",
        "news.noNews": "No news available",
        "news.minutesAgo": "m ago",
        "news.hoursAgo": "h ago",
        "news.daysAgo": "d ago",

        // Sidebar - Calendar
        "calendar.loading": "Loading events...",
        "calendar.noEvents": "No upcoming events",
        "calendar.today": "Today",
        "calendar.tomorrow": "Tomorrow",

        // Sidebar - Brokers
        "brokers.loading": "Loading brokers...",
        "brokers.noData": "No data for selected dates",
        "brokers.rank": "#",
        "brokers.code": "Code",
        "brokers.value": "Val",
        "brokers.volume": "Vol",
        "brokers.frequency": "Freq",

        // Sidebar - Settings
        "settings.language": "Language",
        "settings.languageDesc": "Change the default language",
        "settings.langEnglish": "English",
        "settings.langIndonesian": "Bahasa Indonesia",
        "settings.reportIssue": "Report an Issue",
        "settings.reportIssueDesc": "Report a bug or missing symbol",
        "settings.report": "Report",
        "settings.contactUs": "Contact Us",
        "settings.contactUsDesc": "Ask information or collaboration",
        "settings.contact": "Contact",
        "settings.legal": "Terms of Service & Privacy Policy",

        // Header
        "header.search": "Search",
        "header.tickers": "Tickers",
        "header.news": "News",
        "header.searching": "Searching...",
        "header.noTickers": "No tickers found for",
        "header.noNews": "No news found.",
        "header.marketOpen": "Market Open (10m delay)",
        "header.marketClosed": "Market Closed",

        // Stock Detail Modal
        "modal.stockDetails": "Stock Details",
        "modal.company": "Company",
        "modal.indices": "Indices",
        "modal.marketStatus": "Market Status",
        "modal.open": "Open",
        "modal.viewOnIdx": "View on IDX",
        "modal.chart": "Chart",
        "modal.high": "High",
        "modal.noChartData": "No Chart Data Available",
        "modal.latestNews": "Latest News",
        "modal.noNewsAvailable": "No news available.",
        "modal.removeFromFavorites": "Remove from Favorites",
        "modal.addToFavorites": "Add to Favorites",
        "modal.unhideSymbol": "Unhide Symbol",
        "modal.hideFromBubbles": "Hide from Bubbles",
        "modal.watchlists": "Watchlists",
    },
    id: {
        // Sidebar nav labels
        "nav.indices": "Indeks",
        "nav.watchlist": "Watchlist",
        "nav.news": "Berita",
        "nav.calendar": "Kalender",
        "nav.brokers": "Broker",
        "nav.settings": "Pengaturan",

        // Sidebar - Indices
        "indices.search": "Cari indeks...",
        "indices.loading": "Memuat indeks...",
        "indices.noResults": "Tidak ada indeks ditemukan",

        // Sidebar - Watchlist
        "watchlist.stocks": "saham",
        "watchlist.create": "Buat Watchlist",
        "watchlist.editTitle": "Edit Watchlist",
        "watchlist.newTitle": "Watchlist Baru",
        "watchlist.namePlaceholder": "Nama watchlist",
        "watchlist.searchStocks": "Cari saham untuk ditambahkan...",
        "watchlist.selectedStocks": "Saham Terpilih",
        "watchlist.selectedHidden": "saham terpilih tersembunyi (tidak cocok pencarian)",
        "watchlist.searchResults": "Hasil Pencarian",
        "watchlist.noMatches": "Tidak ada hasil",
        "watchlist.delete": "Hapus Watchlist",
        "watchlist.deleteConfirm": "Hapus watchlist ini?",
        "watchlist.save": "Simpan",

        // Sidebar - News
        "news.loading": "Memuat berita...",
        "news.noNews": "Tidak ada berita",
        "news.minutesAgo": "m lalu",
        "news.hoursAgo": "j lalu",
        "news.daysAgo": "h lalu",

        // Sidebar - Calendar
        "calendar.loading": "Memuat agenda...",
        "calendar.noEvents": "Tidak ada agenda mendatang",
        "calendar.today": "Hari Ini",
        "calendar.tomorrow": "Besok",

        // Sidebar - Brokers
        "brokers.loading": "Memuat broker...",
        "brokers.noData": "Tidak ada data untuk tanggal terpilih",
        "brokers.rank": "#",
        "brokers.code": "Kode",
        "brokers.value": "Nilai",
        "brokers.volume": "Vol",
        "brokers.frequency": "Frek",

        // Sidebar - Settings
        "settings.language": "Bahasa",
        "settings.languageDesc": "Ubah bahasa default",
        "settings.langEnglish": "English",
        "settings.langIndonesian": "Bahasa Indonesia",
        "settings.reportIssue": "Laporkan Masalah",
        "settings.reportIssueDesc": "Laporkan bug atau simbol hilang",
        "settings.report": "Lapor",
        "settings.contactUs": "Hubungi Kami",
        "settings.contactUsDesc": "Tanya informasi atau kolaborasi",
        "settings.contact": "Hubungi",
        "settings.legal": "Syarat Layanan & Kebijakan Privasi",

        // Header
        "header.search": "Cari",
        "header.tickers": "Saham",
        "header.news": "Berita",
        "header.searching": "Mencari...",
        "header.noTickers": "Tidak ada saham ditemukan untuk",
        "header.noNews": "Tidak ada berita.",
        "header.marketOpen": "Pasar Buka (delay 10m)",
        "header.marketClosed": "Pasar Tutup",

        // Stock Detail Modal
        "modal.stockDetails": "Detail Saham",
        "modal.company": "Perusahaan",
        "modal.indices": "Indeks",
        "modal.marketStatus": "Status Pasar",
        "modal.open": "Buka",
        "modal.viewOnIdx": "Lihat di IDX",
        "modal.chart": "Grafik",
        "modal.high": "Tinggi",
        "modal.noChartData": "Tidak Ada Data Grafik",
        "modal.latestNews": "Berita Terbaru",
        "modal.noNewsAvailable": "Tidak ada berita.",
        "modal.removeFromFavorites": "Hapus dari Favorit",
        "modal.addToFavorites": "Tambah ke Favorit",
        "modal.unhideSymbol": "Tampilkan Simbol",
        "modal.hideFromBubbles": "Sembunyikan dari Bubble",
        "modal.watchlists": "Watchlist",
    },
}

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [storedLang, setStoredLang, isLoaded] = useLocalStorage<Language>(
        STORAGE_KEYS.LANGUAGE,
        "en"
    )

    const [language, setLanguageState] = useState<Language>("en")

    // Sync local state with localStorage once loaded
    useEffect(() => {
        if (isLoaded) {
            setLanguageState(storedLang)
        }
    }, [isLoaded, storedLang])

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang)
        setStoredLang(lang)
    }, [setStoredLang])

    const t = useCallback((key: string): string => {
        return translations[language]?.[key] || translations.en[key] || key
    }, [language])

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
