"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DIMENSIONS } from "@/data/dimensions";
import { RECOMMENDATIONS } from "@/data/recommendations";
import { getLevelForScore } from "@/data/levels";
import { getLevelColor } from "@/lib/utils/level-colors";
import type { DimensionId } from "@/types";
import type { Trend } from "@/lib/queries/team-dashboard";

interface TeamRecommendationsProps {
  dimensionScores: Record<string, number>;
  dimensionTrends: Record<string, Trend> | null;
}

function DimensionTrendBadge({ trend }: { trend: Trend }) {
  const sign = trend.diff > 0 ? "+" : "";
  const formattedDiff = `${sign}${trend.diff.toFixed(2)}`;

  if (trend.direction === "up") {
    return (
      <span className="text-xs font-medium text-emerald-600">
        ↑ {formattedDiff}
      </span>
    );
  }
  if (trend.direction === "down") {
    return (
      <span className="text-xs font-medium text-red-600">
        ↓ {formattedDiff}
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-muted-foreground">
      → Stable
    </span>
  );
}

export function TeamRecommendations({
  dimensionScores,
  dimensionTrends,
}: TeamRecommendationsProps) {
  // Sort dimensions by score ascending (weakest first)
  const sortedDimensions = [...DIMENSIONS].sort(
    (a, b) => (dimensionScores[a.id] ?? 0) - (dimensionScores[b.id] ?? 0),
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedDimensions.map((dim) => {
        const score = dimensionScores[dim.id] ?? 0;
        const level = getLevelForScore(score);
        const { bg, text } = getLevelColor(score);
        const recommendation = RECOMMENDATIONS[dim.id as DimensionId]?.[level.level] ?? "";
        const trend = dimensionTrends?.[dim.id];

        return (
          <Card key={dim.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{dim.label}</CardTitle>
                {trend && <DimensionTrendBadge trend={trend} />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{score.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">/ 4</span>
                <Badge className={`${bg} ${text} border-0 text-xs`}>
                  {level.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {recommendation}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
