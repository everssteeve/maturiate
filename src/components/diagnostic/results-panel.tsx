"use client";

import { DIMENSIONS } from "@/data/dimensions";
import { LEVELS, getLevelForScore } from "@/data/levels";
import { RECOMMENDATIONS } from "@/data/recommendations";
import { RadarChart } from "@/components/charts/radar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DimensionId, DimensionScores } from "@/types";

interface ResultsPanelProps {
  teamName: string;
  filledByName: string;
  dimensionScores: DimensionScores;
  globalScore: number;
  globalLevel: number;
  completedAt: Date;
  startedAt: Date | null;
}

function formatDuration(startedAt: Date, completedAt: Date): string {
  const diffMs = completedAt.getTime() - startedAt.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Moins d'une minute";
  if (minutes === 1) return "1 minute";
  return `${minutes} minutes`;
}

export function ResultsPanel({
  teamName,
  filledByName,
  dimensionScores,
  globalScore,
  globalLevel,
  completedAt,
  startedAt,
}: ResultsPanelProps) {
  const level = LEVELS.find((l) => l.level === globalLevel) ?? LEVELS[0];

  return (
    <div className="space-y-8">
      {/* Header with global score */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Résultats du diagnostic</h1>
        <p className="mt-1 text-muted-foreground">{teamName}</p>
      </div>

      {/* Global score card */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <div className="text-5xl font-bold text-primary">
            {globalScore.toFixed(2)}<span className="text-2xl text-muted-foreground">/4</span>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">
              Niveau {globalLevel} — {level.name}
            </p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">{level.description}</p>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>
              Rempli par {filledByName}
            </span>
            <span>
              {new Date(completedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            {startedAt && (
              <span>Complété en {formatDuration(new Date(startedAt), new Date(completedAt))}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Radar chart */}
      <Card>
        <CardHeader>
          <CardTitle>Scores par dimension</CardTitle>
        </CardHeader>
        <CardContent>
          <RadarChart dimensionScores={dimensionScores} />
        </CardContent>
      </Card>

      {/* Detail by dimension */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Détail par dimension</h2>
        {DIMENSIONS.map((dim) => {
          const score = dimensionScores[dim.id] ?? 1;
          const dimLevel = getLevelForScore(score);
          const recommendation =
            RECOMMENDATIONS[dim.id as DimensionId]?.[dimLevel.level] ?? "";

          return (
            <Card key={dim.id}>
              <CardContent className="pt-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">{dim.label}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary">
                      {score.toFixed(1)}/4
                    </span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {dimLevel.name}
                    </span>
                  </div>
                </div>
                {/* Score bar */}
                <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${((score - 1) / 3) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{recommendation}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
