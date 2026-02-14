import "../styles/globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Darker_Grotesque } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const darkerGrotesque = Darker_Grotesque({
    subsets: ["latin"],
    weight: ["700", "800", "900"],
    variable: "--font-logo"
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bubblesidx.repixel1.com";
const SITE_NAME = "Bubbles IDX";
const SITE_DESCRIPTION =
    "Indonesian stock market visualization with interactive bubbles. Track IDX stocks, indices, price changes, and market trends at a glance.";

export const metadata: Metadata = {
    // Basic Meta
    title: {
        default: `${SITE_NAME} — IDX Stock Market Visualizer`,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: [
        "IDX", "Indonesian stock market", "stock market visualization",
        "saham Indonesia", "IHSG", "bursa efek Indonesia",
        "real-time stocks", "stock bubbles", "market heatmap",
        "IDX30", "LQ45", "JII", "stock tracker", "harga saham",
    ],
    authors: [{ name: "Bubbles IDX" }],
    creator: "Bubbles IDX",
    publisher: "Bubbles IDX",

    // Canonical URL
    metadataBase: new URL(SITE_URL),
    alternates: {
        canonical: "/",
        languages: {
            "en": "/",
            "id": "/",
        },
    },

    // Open Graph (Facebook, LinkedIn, WhatsApp)
    openGraph: {
        type: "website",
        locale: "en_US",
        alternateLocale: "id_ID",
        url: SITE_URL,
        siteName: SITE_NAME,
        title: `${SITE_NAME} — IDX Stock Market Visualizer`,
        description: SITE_DESCRIPTION,
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Bubbles IDX — Interactive Indonesian Stock Market Visualization",
                type: "image/png",
            },
        ],
    },

    // Twitter Card
    twitter: {
        card: "summary_large_image",
        title: `${SITE_NAME} — IDX Stock Market Visualizer`,
        description: SITE_DESCRIPTION,
        images: ["/og-image.png"],
    },

    // App & PWA hints
    applicationName: SITE_NAME,
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: SITE_NAME,
    },
    formatDetection: {
        telephone: false,
    },

    // Indexing
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },

    // Verification (add your codes when ready)
    // verification: {
    //     google: "YOUR_GOOGLE_VERIFICATION_CODE",
    //     yandex: "YOUR_YANDEX_VERIFICATION_CODE",
    // },

    // Icons
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

// JSON-LD Structured Data for Google Rich Results
const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web Browser",
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
    },
    creator: {
        "@type": "Organization",
        name: "Bubbles IDX",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className={`${inter.className} ${darkerGrotesque.variable}`}>{children}</body>
        </html>
    );
}
