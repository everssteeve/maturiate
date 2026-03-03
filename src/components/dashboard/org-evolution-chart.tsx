"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

import { DIMENSIONS } from "@/data/dimensions";
import type { CampaignEvolutionPoint } from "@/lib/queries/org-dashboard";

interface OrgEvolutionChartProps {
  data: CampaignEvolutionPoint[];
}

const DIMENSION_COLORS: Record<string, string> = {
  tools: "#2563eb",
  process: "#16a34a",
  docs: "#d97706",
  quality: "#dc2626",
  collab: "#9333ea",
  vision: "#0891b2",
};

export function OrgEvolutionChart({ data }: OrgEvolutionChartProps) {
  const [visibleDimensions, setVisibleDimensions] = useState<Set<string>>(new Set());

  if (data.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center text-muted-foreground">
        Aucune donnée d&apos;évolution disponible.
      </div>
    );
  }

  const chartData = data.map((point) => ({
    name: point.campaignName,
    global: point.avgGlobalScore,
    ...Object.fromEntries(
      DIMENSIONS.map((dim) => [dim.id, point.avgDimensionScores[dim.id] ?? null]),
    ),
  }));

  function toggleDimension(dimId: string) {
    setVisibleDimensions((prev) => {
      const next = new Set(prev);
      if (next.has(dimId)) {
        next.delete(dimId);
      } else {
        next.add(dimId);
      }
      return next;
    });
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            domain={[1, 4]}
            ticks={[1, 2, 3, 4]}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <ReferenceLine y={1.75} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.4} />
          <ReferenceLine y={2.5} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.4} />
          <ReferenceLine y={3.25} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.4} />
          <Line
            type="monotone"
            dataKey="global"
            name="Score global"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          {DIMENSIONS.map(
            (dim) =>
              visibleDimensions.has(dim.id) && (
                <Line
                  key={dim.id}
                  type="monotone"
                  dataKey={dim.id}
                  name={dim.short}
                  stroke={DIMENSION_COLORS[dim.id]}
                  strokeWidth={1.5}
                  dot={{ r: 3 }}
                  strokeDasharray="4 2"
                />
              ),
          )}
          <Legend />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap gap-2">
        {DIMENSIONS.map((dim) => (
          <button
            key={dim.id}
            type="button"
            onClick={() => toggleDimension(dim.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              visibleDimensions.has(dim.id)
                ? "border-transparent text-white"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
            style={
              visibleDimensions.has(dim.id)
                ? { backgroundColor: DIMENSION_COLORS[dim.id] }
                : undefined
            }
          >
            {dim.short}
          </button>
        ))}
      </div>
    </div>
  );
}
