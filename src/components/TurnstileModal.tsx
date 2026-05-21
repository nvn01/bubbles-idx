"use client"

import { useEffect, useRef, useState } from "react"

interface TurnstileModalProps {
    isOpen: boolean
    onSolved: (token: string) => void
    onClose: () => void
}

export function TurnstileModal({ isOpen, onSolved, onClose }: TurnstileModalProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [scriptLoaded, setScriptLoaded] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    useEffect(() => {
        if (typeof window === "undefined") return

        // Inject script if not already loaded in the document
        if (!(window as any).turnstile) {
            const script = document.createElement("script")
            script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            script.async = true
            script.defer = true
            script.onload = () => setScriptLoaded(true)
            document.body.appendChild(script)
        } else {
            setScriptLoaded(true)
        }
    }, [])

    useEffect(() => {
        if (!isOpen || !scriptLoaded || !containerRef.current || !(window as any).turnstile) return

        let widgetId: string | null = null

        try {
            // Clear any existing elements inside the container to avoid double widgets
            containerRef.current.innerHTML = ""
            const widgetDiv = document.createElement("div")
            widgetDiv.id = "turnstile-widget"
            containerRef.current.appendChild(widgetDiv)

            // Render explicit Turnstile
            const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"
            
            widgetId = (window as any).turnstile.render("#turnstile-widget", {
                sitekey: siteKey,
                theme: "dark",
                callback: (token: string) => {
                    setIsVerifying(true)
                    setErrorMsg("")
                    onSolved(token)
                },
                "error-callback": () => {
                    setIsVerifying(false)
                    setErrorMsg("Verification challenge failed. Please refresh or retry.")
                }
            })
        } catch (e) {
            console.error("Turnstile render error:", e)
        }

        return () => {
            if (widgetId && (window as any).turnstile) {
                try {
                    (window as any).turnstile.remove(widgetId)
                } catch (e) {
                    // Ignore removal failures on close/unmount
                }
            }
        }
    }, [isOpen, scriptLoaded, onSolved])

    // Reset status on open/close
    useEffect(() => {
        if (isOpen) {
            setIsVerifying(false)
            setErrorMsg("")
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all duration-300">
            <div className="relative w-full max-w-md p-8 border border-white/10 rounded-2xl bg-slate-950/90 backdrop-blur-2xl shadow-2xl text-center overflow-hidden flex flex-col items-center">
                {/* Visual Glassmorphic Glow Backgrounds */}
                <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

                {/* Premium Shield Icon */}
                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>

                {/* Heading & Text */}
                <h3 className="mb-2 text-xl font-bold text-white tracking-tight">Security Verification</h3>
                <p className="mb-6 text-sm text-slate-400 max-w-xs leading-relaxed">
                    Suspicious automated traffic was detected. Please complete the quick verification below to restore instant public access.
                </p>

                {/* Explicit Turnstile Mount Container */}
                <div className="flex items-center justify-center min-h-[65px] w-full mb-4">
                    <div ref={containerRef} />
                </div>

                {/* Processing State Indicator */}
                {isVerifying && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-cyan-400 animate-pulse">
                        <svg className="animate-spin h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verifying your response...
                    </div>
                )}

                {errorMsg && (
                    <p className="mt-2 text-xs text-rose-500 font-medium bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
                        {errorMsg}
                    </p>
                )}

                {/* Cancel Link */}
                <button
                    onClick={onClose}
                    className="mt-6 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-white/10 px-4 py-2 rounded-lg"
                    disabled={isVerifying}
                >
                    Cancel & Return
                </button>
            </div>
        </div>
    )
}
