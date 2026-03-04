"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

import { DIMENSIONS } from "@/data/dimensions";
import type { TeamDiagnosticEntry } from "@/lib/queries/team-dashboard";

interface TeamRadarComparisonProps {
  primary: TeamDiagnosticEntry;
  comparison?: TeamDiagnosticEntry;
}

function formatDiagnosticDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

export function TeamRadarComparison({ primary, comparison }: TeamRadarComparisonProps) {
  const data = DIMENSIONS.map((dim) => ({
    dimension: dim.short,
    current: primary.dimensionScores[dim.id] ?? 0,
    ...(comparison
      ? { comparison: comparison.dimensionScores[dim.id] ?? 0 }
      : {}),
    fullMark: 4,
  }));

  const primaryLabel = `${formatDiagnosticDate(primary.completedAt)} — ${primary.globalScore.toFixed(2)}`;
  const comparisonLabel = comparison
    ? `${formatDiagnosticDate(comparison.completedAt)} — ${comparison.globalScore.toFixed(2)}`
    : null;

  return (
    <div>
      <ResponsiveContainer width="100%" height={350}>
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="80%">
          <PolarGrid />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 13, fill: "hsl(var(--foreground))" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 4]}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickCount={5}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Radar
            name={primaryLabel}
            dataKey="current"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          {comparison && (
            <Radar
              name={comparisonLabel!}
              dataKey="comparison"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.1}
              strokeWidth={1.5}
              strokeDasharray="4 2"
            />
          )}
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
