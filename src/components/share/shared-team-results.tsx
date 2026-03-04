"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamTimeline } from "@/components/dashboard/team-timeline";
import { TeamRadarComparison } from "@/components/dashboard/team-radar-comparison";
import { TeamEvolutionChart } from "@/components/dashboard/team-evolution-chart";
import { TeamScoreSummary } from "@/components/dashboard/team-score-summary";
import { TeamRecommendations } from "@/components/dashboard/team-recommendations";
import type { TeamDashboardData } from "@/lib/queries/team-dashboard";

interface SharedTeamResultsProps {
  data: TeamDashboardData;
}

export function SharedTeamResults({ data }: SharedTeamResultsProps) {
  const [selectedIds, setSelectedIds] = useState<[string] | [string, string]>(() => {
    if (data.diagnostics.length === 0) return [""] as unknown as [string];
    return [data.diagnostics[0].id];
  });

  function handleSelect(diagnosticId: string) {
    setSelectedIds((prev) => {
      const primaryId = prev[0];
      const comparisonId = prev.length === 2 ? prev[1] : null;
      if (diagnosticId === primaryId) return prev;
      if (diagnosticId === comparisonId) return [primaryId];
      return [primaryId, diagnosticId];
    });
  }

  if (data.diagnostics.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12">
          <p className="text-lg font-medium">Aucun résultat disponible</p>
          <p className="text-sm text-muted-foreground">
            Cette équipe n&apos;a pas encore de diagnostic complété.
          </p>
        </CardContent>
      </Card>
    );
  }

  const primaryDiagnostic = data.diagnostics.find((d) => d.id === selectedIds[0])!;
  const comparisonDiagnostic =
    selectedIds.length === 2
      ? data.diagnostics.find((d) => d.id === selectedIds[1])
      : undefined;

  return (
    <div className="space-y-6">
      <TeamScoreSummary
        globalScore={data.latestDiagnostic!.globalScore}
        globalLevel={data.latestDiagnostic!.globalLevel}
        trend={data.globalTrend}
        diagnosticCount={data.diagnostics.length}
      />

      <Card>
        <CardHeader>
          <CardTitle>Historique des diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamTimeline
            diagnostics={data.diagnostics}
            selectedIds={selectedIds}
            onSelect={handleSelect}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Profil de maturité
              {comparisonDiagnostic && " — Comparaison"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamRadarComparison
              primary={primaryDiagnostic}
              comparison={comparisonDiagnostic}
            />
          </CardContent>
        </Card>

        {data.evolution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Évolution temporelle</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamEvolutionChart data={data.evolution} />
            </CardContent>
          </Card>
        )}
      </div>

      {data.latestDiagnostic && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Recommandations personnalisées</h2>
          <TeamRecommendations
            dimensionScores={data.latestDiagnostic.dimensionScores}
            dimensionTrends={data.dimensionTrends}
          />
        </div>
      )}
    </div>
  );
}
