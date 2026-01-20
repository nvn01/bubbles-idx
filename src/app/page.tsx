"use client";

import { useEffect, useState } from "react";
import { BubbleChart } from "../components/BubbleChart";

export default function Home() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/stocks");
            const json = await res.json();
            setData(json);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(); // Initial
        const interval = setInterval(fetchData, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="min-h-screen bg-neutral-900 overflow-hidden relative">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-white z-10 pointer-events-none">
                    Loading Market Data...
                </div>
            )}
            <BubbleChart data={data} />

            <div className="absolute top-4 left-4 text-white/50 text-sm z-10 pointer-events-none">
                <h1 className="text-xl font-bold text-white">IDX30 Live</h1>
                <p>Updates every minute</p>
            </div>
        </main>
    );
}
