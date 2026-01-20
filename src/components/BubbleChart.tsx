"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface StockData {
    id: number;
    symbol: string;
    name: string;
    price: number;
    change: number; // Percentage
    volume: number;
    marketCap: number;
}

interface BubbleChartProps {
    data: StockData[];
}

export const BubbleChart: React.FC<BubbleChartProps> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!data || !svgRef.current) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .style("background", "#111");

        svg.selectAll("*").remove(); // Clear previous

        // Scale for radius based on Market Cap (or Volume if MC is proxy)
        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(data, d => d.marketCap) || 1])
            .range([20, 80]); // Min/Max radius

        // Color scale for Change %
        const colorScale = (change: number) => {
            if (change > 0) return "#22c55e"; // Green
            if (change < 0) return "#ef4444"; // Red
            return "#94a3b8"; // Grey
        };

        // Nodes (create a copy to avoid mutating props)
        const nodes = data.map(d => ({
            ...d,
            radius: radiusScale(d.marketCap),
            x: width / 2,
            y: height / 2
        }));

        // Force Simulation
        const simulation = d3.forceSimulation(nodes as any)
            .force("charge", d3.forceManyBody().strength(5))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius((d: any) => d.radius + 2))
            .on("tick", ticked);

        function ticked() {
            const u = svg
                .selectAll("g")
                .data(nodes);

            const group = u.enter()
                .append("g")
                .attr("class", "node")
                .call(d3.drag<SVGGElement, any>() // Drag interaction
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended) as any
                );

            // Circles
            group.append("circle")
                .attr("r", (d: any) => d.radius)
                .style("fill", (d: any) => colorScale(d.change))
                .style("opacity", 0.9)
                .style("stroke", "#fff")
                .style("stroke-width", "1px");

            // Text: Symbol
            group.append("text")
                .text((d: any) => d.symbol)
                .attr("dy", "-0.2em")
                .style("text-anchor", "middle")
                .style("font-family", "sans-serif")
                .style("font-weight", "bold")
                .style("fill", "white")
                .style("font-size", (d: any) => Math.min(d.radius / 2, 14) + "px")
                .style("pointer-events", "none")
                .style("user-select", "none");

            // Text: Change %
            group.append("text")
                .text((d: any) => `${d.change.toFixed(2)}%`)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-family", "sans-serif")
                .style("fill", "white")
                .style("font-size", (d: any) => Math.min(d.radius / 3, 12) + "px")
                .style("pointer-events", "none")
                .style("user-select", "none");

            // Merge and update positions
            u.merge(group as any)
                .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

            u.exit().remove();
        }

        // Drag functions
        function dragstarted(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event: any, d: any) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }, [data]);

    return <svg ref={svgRef} className="block w-full h-full" />;
};
