"use client"

import { useState } from "react"
import { Header } from "~/components/Header"
import { BubbleCanvas } from "~/components/BubbleCanvas"
import { ThemeProvider } from "~/contexts/ThemeContext"
import type { TimePeriod } from "~/lib/bubble-physics"

const IDX80_STOCKS = [
    "AADI", "ACES", "ADMR", "ADRO", "AKRA", "AMMN", "AMRT", "ANTM", "ARTO", "ASII",
    "AVIA", "BBCA", "BBNI", "BBRI", "BBTN", "BMRI", "BRMS", "BRPT", "BSDE", "BTPS",
    "BUKA", "BUMI", "CMRY", "CPIN", "CTRA", "DSNG", "DSSA", "ELSA", "EMTK", "ENRG",
    "ERAA", "ESSA", "EXCL", "GOTO", "HEAL", "HRUM", "ICBP", "INCO", "INDF", "INDY",
    "INKP", "INTP", "ISAT", "ITMG", "JPFA", "JSMR", "KIJA", "KLBF", "KPIG", "LSIP",
    "MAPA", "MAPI", "MBMA", "MDKA", "MEDC", "MIKA", "MTEL", "MYOR", "NCKL", "PANI",
    "PGAS", "PGEO", "PNBN", "PNLF", "PTBA", "PTRO", "PWON", "RAJA", "RATU", "SCMA",
    "SIDO", "SMGR", "SMRA", "SSIA", "TAPG", "TLKM", "TOWR", "UNTR", "UNVR", "WIFI",
]

function IndexContent() {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("1D")
    const [selectedSymbols] = useState<string[]>(IDX80_STOCKS)

    return (
        <div className="flex flex-col h-screen">
            <Header timePeriod={timePeriod} setTimePeriod={setTimePeriod} />
            <BubbleCanvas timePeriod={timePeriod} selectedSymbols={selectedSymbols} />
        </div>
    )
}

export default function Home() {
    return (
        <ThemeProvider>
            <IndexContent />
        </ThemeProvider>
    )
}
