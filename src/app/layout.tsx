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
    title: "Bubbles Idx. | IDX30 Market Visualization",
    description: "IDX30 Stock Market Visualization",
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
