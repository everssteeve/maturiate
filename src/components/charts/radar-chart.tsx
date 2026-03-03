"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

import { DIMENSIONS } from "@/data/dimensions";
import type { DimensionScores } from "@/types";

interface RadarChartProps {
  dimensionScores: DimensionScores;
}

export function RadarChart({ dimensionScores }: RadarChartProps) {
  const data = DIMENSIONS.map((dim) => ({
    dimension: dim.short,
    score: dimensionScores[dim.id] ?? 0,
    fullMark: 4,
  }));

  return (
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
        <Radar
          name="Score"
          dataKey="score"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
