"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamTimeline } from "@/components/dashboard/team-timeline";
import { TeamRadarComparison } from "@/components/dashboard/team-radar-comparison";
import { TeamEvolutionChart } from "@/components/dashboard/team-evolution-chart";
import { TeamScoreSummary } from "@/components/dashboard/team-score-summary";
import { TeamRecommendations } from "@/components/dashboard/team-recommendations";
import type { TeamDashboardData } from "@/lib/queries/team-dashboard";

interface TeamDashboardProps {
  data: TeamDashboardData;
  orgId: string;
  canStartDiagnostic: boolean;
}

export function TeamDashboard({ data, orgId, canStartDiagnostic }: TeamDashboardProps) {
  const [selectedIds, setSelectedIds] = useState<[string] | [string, string]>(() => {
    if (data.diagnostics.length === 0) return [""] as unknown as [string];
    return [data.diagnostics[0].id];
  });

  function handleSelect(diagnosticId: string) {
    setSelectedIds((prev) => {
      const primaryId = prev[0];
      const comparisonId = prev.length === 2 ? prev[1] : null;

      // Clicking the primary: do nothing
      if (diagnosticId === primaryId) return prev;

      // Clicking the current comparison: deselect it
      if (diagnosticId === comparisonId) return [primaryId];

      // Otherwise: set as comparison (replace existing)
      return [primaryId, diagnosticId];
    });
  }

  // Empty state
  if (data.diagnostics.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <ClipboardList className="size-12 text-muted-foreground" />
          <div className="text-center">
            <p className="text-lg font-medium">Aucun diagnostic complété</p>
            <p className="text-sm text-muted-foreground">
              Cette équipe n&apos;a pas encore rempli de diagnostic.
            </p>
          </div>
          {canStartDiagnostic && (
            <a
              href={`/orgs/${orgId}/diagnostic/${data.team.id}`}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Lancer un diagnostic
            </a>
          )}
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
      {/* Score summary cards */}
      <TeamScoreSummary
        globalScore={data.latestDiagnostic!.globalScore}
        globalLevel={data.latestDiagnostic!.globalLevel}
        trend={data.globalTrend}
        diagnosticCount={data.diagnostics.length}
      />

      {/* Timeline */}
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

      {/* Radar + Evolution side by side */}
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

      {/* Recommendations */}
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
