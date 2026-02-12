import type { Metadata } from 'next'
import { prisma } from '~/lib/prisma'
import { StockDetailContent } from '~/components/StockDetailContent'
import { ThemeProvider } from '~/contexts/ThemeContext'
import { LanguageProvider } from '~/contexts/LanguageContext'

interface Props {
    params: Promise<{ symbol: string }>
}

// Generate dynamic metadata for SEO
export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const { symbol } = await params
    const stock = await prisma.stock.findUnique({
        where: { kode_emiten: symbol },
        include: {
            indices: true,
            tickers: {
                orderBy: { ts: 'desc' },
                take: 1
            }
        }
    })

    if (!stock) {
        return {
            title: 'Stock Not Found - Bubbles IDX',
            description: 'The requested stock could not be found.'
        }
    }

    const price = stock.tickers[0]?.price || 0
    const change = stock.tickers[0]?.d || 0
    const changeStr = change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`

    return {
        title: `${symbol} - ${stock.nama_emiten} Price: Rp ${price.toLocaleString('id-ID')} (${changeStr})`,
        description: `Track real-time price, charts, and news for ${symbol} (${stock.nama_emiten}). Latest price: Rp ${price.toLocaleString('id-ID')}, Change: ${changeStr}.`,
        openGraph: {
            title: `${symbol} Price: Rp ${price.toLocaleString('id-ID')} (${changeStr})`,
            description: `Real-time chart and analysis for ${stock.nama_emiten} (${symbol}) on Bubbles IDX.`,
        },
        keywords: [symbol, stock.nama_emiten, "harga saham", "IDX", "saham indonesia", "finance", "investment"]
    }
}

// Server Component
export default async function StockPage({ params }: Props) {
    const { symbol } = await params

    // Fetch stock data
    const stock = await prisma.stock.findUnique({
        where: { kode_emiten: symbol },
        include: {
            indices: true,
            tickers: {
                orderBy: { ts: 'desc' },
                take: 1
            }
        }
    })

    if (!stock) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a] text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Stock Not Found</h1>
                    <p className="text-gray-400 mb-4">The stock {symbol} could not be found.</p>
                    <a href="/" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition">Go Home</a>
                </div>
            </div>
        )
    }

    // Transform Prisma data to component format
    const ticker = stock.tickers[0]
    const stockData = {
        symbol: stock.kode_emiten,
        name: stock.nama_emiten,
        price: ticker?.price || 0,
        change: ticker?.d || 0,
        changes: {
            h: ticker?.h || 0,
            d: ticker?.d || 0,
            w: ticker?.w || 0,
            m: ticker?.m || 0,
            y: ticker?.y || 0,
        },
        indices: stock.indices.map(i => i.kode)
    }

    return (
        <ThemeProvider>
            <LanguageProvider>
                <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                    {/* Wrap in a container to center it like the modal */}
                    <StockDetailContent
                        stock={stockData}
                        isModal={false}
                    // For SEO page, watchlists/favorites are local-only, so we pass empty defaults
                    // The component handles this gracefully
                    />
                </div>
            </LanguageProvider>
        </ThemeProvider>
    )
}
