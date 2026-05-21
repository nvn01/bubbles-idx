"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { TurnstileModal } from "./TurnstileModal"

interface TurnstileContextProps {
    triggerChallenge: () => Promise<string | null>
}

const TurnstileContext = createContext<TurnstileContextProps | undefined>(undefined)

export function useTurnstile() {
    const context = useContext(TurnstileContext)
    if (!context) {
        throw new Error("useTurnstile must be used within a TurnstileProvider")
    }
    return context
}

export function TurnstileProvider({ children }: { children: React.ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [resolveChallenge, setResolveChallenge] = useState<((token: string | null) => void) | null>(null)

    // A helper to programmatically trigger the Turnstile verification challenge
    const triggerChallenge = useCallback(() => {
        return new Promise<string | null>((resolve) => {
            setIsModalOpen(true)
            setResolveChallenge(() => (token: string | null) => {
                setIsModalOpen(false)
                resolve(token)
            })
        })
    }, [])

    useEffect(() => {
        if (typeof window === "undefined") return

        // Save reference to the original window.fetch
        const originalFetch = window.fetch

        // Intercept every fetch request globally on the client
        window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
            const response = await originalFetch(input, init)

            // If we receive a 429 Too Many Requests response
            if (response.status === 429) {
                const clone = response.clone()
                try {
                    const data = await clone.json()
                    // If the response explicitly states that Turnstile verification is required
                    if (data && data.turnstileRequired) {
                        console.log("[Turnstile Interceptor] 429 response captured. Initiating human verification challenge...");
                        
                        // Launch the Turnstile challenge and pause execution of the current fetch promise
                        const solvedToken = await triggerChallenge()

                        if (solvedToken) {
                            console.log("[Turnstile Interceptor] Captcha verified. Autoretrying the initial blocked request...");
                            // Retry the exact original request that failed
                            return originalFetch(input, init)
                        } else {
                            console.warn("[Turnstile Interceptor] Challenge was cancelled or failed verification.");
                        }
                    }
                } catch (e) {
                    // Ignore non-JSON or unparsable 429 bodies and let them fail naturally
                }
            }

            return response
        }

        // Cleanup: restore the original fetch function when the provider unmounts
        return () => {
            window.fetch = originalFetch
        }
    }, [triggerChallenge])

    // Handle token resolution solved by the user
    const handleSolved = useCallback(async (token: string) => {
        try {
            console.log("[Turnstile Provider] Solved! Verifying token on backend...");
            
            // Validate the token against our secure backend endpoint
            const res = await fetch("/api/turnstile/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                console.log("[Turnstile Provider] Verification success! IP is unblocked.");
                if (resolveChallenge) {
                    resolveChallenge(token)
                }
            } else {
                console.error("[Turnstile Provider] Verification rejected by server:", data.error)
                alert(data.error || "Turnstile verification failed. Please try again.")
                if (resolveChallenge) {
                    resolveChallenge(null)
                }
            }
        } catch (e) {
            console.error("[Turnstile Provider] Verification request failed:", e)
            alert("Network error during security validation. Please try again.")
            if (resolveChallenge) {
                resolveChallenge(null)
            }
        }
    }, [resolveChallenge])

    // Handle manual close / cancellation of the challenge modal
    const handleClose = useCallback(() => {
        console.log("[Turnstile Provider] Challenge modal dismissed by user.")
        if (resolveChallenge) {
            resolveChallenge(null)
        }
        setIsModalOpen(false)
    }, [resolveChallenge])

    return (
        <TurnstileContext.Provider value={{ triggerChallenge }}>
            {children}
            <TurnstileModal
                isOpen={isModalOpen}
                onSolved={handleSolved}
                onClose={handleClose}
            />
        </TurnstileContext.Provider>
    )
}
