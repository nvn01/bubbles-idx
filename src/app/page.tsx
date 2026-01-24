"use client";

import { useState, useEffect } from "react";
import { Header, type TimePeriod } from "~/components/Header";
import { BubbleCanvas } from "~/components/BubbleCanvas";
import { ThemeProvider } from "~/contexts/ThemeContext";
import type { StockData } from "~/lib/bubble-physics";

// Temporary mock data - will be replaced by API/WebSocket later
const MOCK_DATA: StockData[] = [
    { id: 1, symbol: "BBCA", name: "Bank Central Asia", price: 9875, change: 2.5 },
    { id: 2, symbol: "BBRI", name: "Bank Rakyat Indonesia", price: 5325, change: -1.2 },
    { id: 3, symbol: "BMRI", name: "Bank Mandiri", price: 6450, change: 3.1 },
    { id: 4, symbol: "TLKM", name: "Telkom Indonesia", price: 3450, change: -0.8 },
    { id: 5, symbol: "ASII", name: "Astra International", price: 5725, change: 1.8 },
    { id: 6, symbol: "UNVR", name: "Unilever Indonesia", price: 4325, change: -2.1 },
    { id: 7, symbol: "GOTO", name: "GoTo Gojek Tokopedia", price: 78, change: 5.4 },
    { id: 8, symbol: "BUKA", name: "Bukalapak", price: 145, change: -3.2 },
    { id: 9, symbol: "ARTO", name: "Bank Jago", price: 2350, change: 4.2 },
    { id: 10, symbol: "ADRO", name: "Adaro Energy", price: 2890, change: 6.1 },
    { id: 11, symbol: "INCO", name: "Vale Indonesia", price: 5125, change: -4.5 },
    { id: 12, symbol: "ANTM", name: "Aneka Tambang", price: 1785, change: 3.8 },
    { id: 13, symbol: "INDF", name: "Indofood", price: 6750, change: -0.5 },
    { id: 14, symbol: "ICBP", name: "Indofood CBP", price: 11250, change: 1.2 },
    { id: 15, symbol: "KLBF", name: "Kalbe Farma", price: 1650, change: -1.8 },
    { id: 16, symbol: "AMRT", name: "Alfamart", price: 2980, change: 2.3 },
    { id: 17, symbol: "MDKA", name: "Merdeka Copper Gold", price: 2450, change: 7.2 },
    { id: 18, symbol: "CPIN", name: "Charoen Pokphand", price: 5175, change: -2.8 },
    { id: 19, symbol: "SMGR", name: "Semen Indonesia", price: 4325, change: 1.5 },
    { id: 20, symbol: "PTBA", name: "Bukit Asam", price: 2890, change: -3.5 },
];

function HomeContent() {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("1D");
    const [stockData, setStockData] = useState<StockData[]>([]);

    // Initialize with mock data - will be replaced with API call / WebSocket
    useEffect(() => {
        // Simulate loading delay
        const timer = setTimeout(() => {
            setStockData(MOCK_DATA);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    // TODO: Fetch data based on timePeriod
    // useEffect(() => {
    //   fetchStockData(timePeriod).then(setStockData);
    // }, [timePeriod]);

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Header timePeriod={timePeriod} setTimePeriod={setTimePeriod} />
            <BubbleCanvas timePeriod={timePeriod} stockData={stockData} />
        </div>
    );
}

export default function Home() {
    return (
        <ThemeProvider>
            <HomeContent />
        </ThemeProvider>
    );
}
