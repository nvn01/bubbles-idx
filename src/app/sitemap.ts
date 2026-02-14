import type { MetadataRoute } from "next";
import { prisma } from "~/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bubblesidx.repixel1.com";
    const now = new Date();

    // Base URL
    const routes: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: now,
            changeFrequency: "hourly",
            priority: 1.0,
        },
    ];

    try {
        // Fetch all active stock symbols
        const stocks = await prisma.stock.findMany({
            select: { kode_emiten: true },
        });

        // Add each stock to sitemap
        const stockRoutes = stocks.map((stock) => ({
            url: `${siteUrl}/stock/${stock.kode_emiten}`,
            lastModified: now,
            changeFrequency: "daily" as const,
            priority: 0.8,
        }));

        return [...routes, ...stockRoutes];
    } catch (error) {
        console.error("Failed to generate sitemap:", error);
        return routes;
    }
}
