import "../styles/globals.css";
import type { Metadata } from "next";
import { Inter, Darker_Grotesque } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const darkerGrotesque = Darker_Grotesque({
    subsets: ["latin"],
    weight: ["700", "800", "900"],
    variable: "--font-logo"
});

export const metadata: Metadata = {
    title: "IDX Stock Market Visualizer | IDX Stock Market Visualizer With Live News",
    description: "IDX Stock Market Visualizer With Live News - Real-time Indonesian stock market bubble visualization",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} ${darkerGrotesque.variable}`}>{children}</body>
        </html>
    );
}
