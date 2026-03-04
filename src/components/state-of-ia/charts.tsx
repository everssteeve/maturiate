"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  Legend,
} from "recharts";

import { DIMENSIONS } from "@/data/dimensions";
import { LEVELS } from "@/data/levels";
import type { AggregatedStats } from "@/lib/queries/state-of-ia";

// ── Distribution Chart ───────────────────────────

export function DistributionChart({ stats }: { stats: AggregatedStats }) {
  const data = stats.distributionByLevel.map((d) => ({
    name: LEVELS.find((l) => l.level === d.level)?.name ?? `Niveau ${d.level}`,
    count: d.count,
    percentage: d.percentage,
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip
            formatter={(value, name) => {
              if (name === "count") return [`${value} orgs`, "Organisations"];
              return [value, name];
            }}
          />
          <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-center gap-6 text-xs text-muted-foreground">
        {data.map((d, i) => (
          <span key={i}>
            {d.name}: {d.percentage}%
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Dimensions Chart ─────────────────────────────

export function DimensionsChart({ stats }: { stats: AggregatedStats }) {
  const data = DIMENSIONS.map((dim) => ({
    dimension: dim.short,
    score: stats.avgByDimension[dim.id] ?? 0,
    fullMark: 4,
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" fontSize={12} />
          <PolarRadiusAxis angle={30} domain={[0, 4]} fontSize={10} />
          <Radar
            name="Score moyen"
            dataKey="score"
            stroke="#60a5fa"
            fill="#60a5fa"
            fillOpacity={0.3}
          />
          <Tooltip formatter={(value) => [Number(value).toFixed(2), "Score moyen"]} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Trends Chart ─────────────────────────────────

export function TrendsChart({
  trends,
}: {
  trends: { year: number; avgGlobalScore: number; totalOrganizations: number }[];
}) {
  if (trends.length <= 1) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Les tendances seront disponibles à partir de la deuxième année de publication.
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" fontSize={12} />
          <YAxis domain={[1, 4]} fontSize={12} />
          <Tooltip
            formatter={(value, name) => {
              if (name === "avgGlobalScore") return [Number(value).toFixed(2), "Score moyen"];
              if (name === "totalOrganizations") return [value, "Organisations"];
              return [value, name];
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="avgGlobalScore"
            stroke="#60a5fa"
            strokeWidth={2}
            name="Score moyen"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Segments Chart ───────────────────────────────

export function SegmentsChart({ stats }: { stats: AggregatedStats }) {
  const SECTOR_LABELS: Record<string, string> = {
    esn: "ESN",
    editor: "Éditeur",
    dsi: "DSI",
    startup: "Startup",
    other: "Autre",
  };

  const data = stats.bySegment.bySector.map((s) => ({
    name: SECTOR_LABELS[s.sector] ?? s.sector,
    score: s.avgScore,
    count: s.count,
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis domain={[0, 4]} fontSize={12} />
          <Tooltip
            formatter={(value, name) => {
              if (name === "score") return [Number(value).toFixed(2), "Score moyen"];
              if (name === "count") return [value, "Organisations"];
              return [value, name];
            }}
          />
          <Bar dataKey="score" fill="#34d399" radius={[4, 4, 0, 0]} name="score" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
